const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Agent = require('../models/Agent');
const { sendComplaintStatusEmail } = require('../services/emailService');
const { sendNotification, notifyAdmins } = require('../services/socketService');

// Helper to update agent active/resolved counters
const updateAgentCounters = async (agentId) => {
  if (!agentId) return;
  try {
    const activeCount = await Complaint.countDocuments({
      assignedAgentId: agentId,
      status: { $in: ['Assigned', 'In Progress', 'Reopened'] },
    });
    const resolvedCount = await Complaint.countDocuments({
      assignedAgentId: agentId,
      status: { $in: ['Resolved', 'Closed'] },
    });

    await Agent.findOneAndUpdate(
      { userId: agentId },
      { activeComplaints: activeCount, resolvedComplaints: resolvedCount }
    );
  } catch (err) {
    console.error('Failed to update agent counters:', err.message);
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (USER role only)
const createComplaint = async (req, res, next) => {
  const { title, description, category, priority } = req.body;
  
  try {
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Store relative path URL
        attachments.push(`/uploads/${file.filename}`);
      });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      attachments,
      userId: req.user._id,
    });

    // Notify admins of new complaint
    notifyAdmins({
      type: 'NEW_COMPLAINT',
      title: 'New Complaint Created',
      message: `A new complaint titled "${complaint.title}" has been registered.`,
      complaintId: complaint._id,
    });

    res.status(201).json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints (filtered by role)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, search } = req.query;
    let query = {};

    // 1. Role-based filtering
    if (req.user.role === 'USER') {
      query.userId = req.user._id;
    } else if (req.user.role === 'AGENT') {
      query.assignedAgentId = req.user._id;
    }

    // 2. Query filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('userId', 'name email phone avatar')
      .populate('assignedAgentId', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email phone avatar')
      .populate('assignedAgentId', 'name email phone avatar');

    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    // Authorization checks
    if (req.user.role === 'USER' && complaint.userId._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this complaint');
    }

    if (req.user.role === 'AGENT' && (!complaint.assignedAgentId || complaint.assignedAgentId._id.toString() !== req.user._id.toString())) {
      res.status(403);
      throw new Error('Not authorized to access this complaint');
    }

    res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private
const updateComplaintStatus = async (req, res, next) => {
  const { status, resolutionSummary } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    // Role validations
    if (req.user.role === 'USER') {
      // User can only close or reopen their own complaints
      if (complaint.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this complaint status');
      }
      if (!['Closed', 'Reopened'].includes(status)) {
        res.status(400);
        throw new Error('Users can only change status to Closed or Reopened');
      }
    }

    if (req.user.role === 'AGENT') {
      // Agent must be the one assigned
      if (!complaint.assignedAgentId || complaint.assignedAgentId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this complaint status');
      }
      if (['Pending'].includes(status)) {
        res.status(400);
        throw new Error('Agents cannot reset status to Pending');
      }
    }

    const previousStatus = complaint.status;
    complaint.status = status;

    // Handle resolution details
    if (status === 'Resolved') {
      complaint.resolutionSummary = resolutionSummary || 'Resolved by agent';
      complaint.resolvedAt = Date.now();
      
      // Calculate resolution time if agent exists and update performance stats
      if (complaint.assignedAgentId) {
        const resolutionTimeMin = Math.round((Date.now() - complaint.createdAt) / (1000 * 60));
        const agentStats = await Agent.findOne({ userId: complaint.assignedAgentId });
        if (agentStats) {
          const totalResolved = agentStats.resolvedComplaints + 1;
          const currentAvg = agentStats.averageResolutionTime;
          agentStats.averageResolutionTime = Math.round(
            (currentAvg * agentStats.resolvedComplaints + resolutionTimeMin) / totalResolved
          );
          await agentStats.save();
        }
      }
    }

    if (status === 'Reopened') {
      complaint.resolvedAt = null;
      complaint.resolutionSummary = '';
    }

    await complaint.save();

    // Trigger update counter for agents
    if (complaint.assignedAgentId) {
      await updateAgentCounters(complaint.assignedAgentId);
    }

    // Notify User
    const user = await User.findById(complaint.userId);
    if (user) {
      sendComplaintStatusEmail(user.email, user.name, complaint.title, status, resolutionSummary);
      sendNotification(user._id, {
        type: 'STATUS_UPDATE',
        title: 'Complaint Update',
        message: `Your complaint "${complaint.title}" status has been changed to ${status}.`,
        complaintId: complaint._id,
      });
    }

    // Notify Agent if Admin made the change
    if (req.user.role === 'ADMIN' && complaint.assignedAgentId) {
      sendNotification(complaint.assignedAgentId, {
        type: 'STATUS_UPDATE',
        title: 'Complaint Update',
        message: `Complaint "${complaint.title}" status has been changed to ${status} by admin.`,
        complaintId: complaint._id,
      });
    }

    res.json({
      success: true,
      message: `Status updated from ${previousStatus} to ${status}`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign an agent to a complaint
// @route   PUT /api/complaints/:id/assign
// @access  Private (ADMIN only)
const assignAgent = async (req, res, next) => {
  const { agentId } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    const previousAgentId = complaint.assignedAgentId;

    // Verify assigned user is an AGENT
    const agentUser = await User.findById(agentId);
    if (!agentUser || agentUser.role !== 'AGENT') {
      res.status(400);
      throw new Error('Assigned user must be a registered Agent');
    }

    complaint.assignedAgentId = agentId;
    // Auto-advance status if pending
    if (complaint.status === 'Pending') {
      complaint.status = 'Assigned';
    }
    
    await complaint.save();

    // Update both agents counters (old and new)
    if (previousAgentId) await updateAgentCounters(previousAgentId);
    await updateAgentCounters(agentId);

    // Notify new agent
    sendNotification(agentId, {
      type: 'ASSIGNMENT',
      title: 'New Complaint Assigned',
      message: `You have been assigned to complaint "${complaint.title}".`,
      complaintId: complaint._id,
    });

    // Notify submitter user
    const user = await User.findById(complaint.userId);
    if (user) {
      sendNotification(user._id, {
        type: 'ASSIGNMENT',
        title: 'Agent Assigned',
        message: `Agent ${agentUser.name} has been assigned to your complaint.`,
        complaintId: complaint._id,
      });
      sendComplaintStatusEmail(user.email, user.name, complaint.title, 'Assigned', `Agent ${agentUser.name} has been assigned to resolve your issue.`);
    }

    res.json({
      success: true,
      message: `Successfully assigned complaint to agent ${agentUser.name}`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignAgent,
};
