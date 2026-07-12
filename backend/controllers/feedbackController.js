const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');
const Agent = require('../models/Agent');

// @desc    Submit feedback for a resolved complaint
// @route   POST /api/feedback
// @access  Private (USER only)
const submitFeedback = async (req, res, next) => {
  const { complaintId, rating, comments } = req.body;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    // Verify ownership
    if (complaint.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You can only submit feedback for your own complaints');
    }

    // Verify resolved status
    if (!['Resolved', 'Closed'].includes(complaint.status)) {
      res.status(400);
      throw new Error('Feedback can only be submitted for Resolved or Closed complaints');
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ complaintId });
    if (existingFeedback) {
      res.status(400);
      throw new Error('Feedback has already been submitted for this complaint');
    }

    // Create Feedback
    const feedback = await Feedback.create({
      complaintId,
      userId: req.user._id,
      rating,
      comments,
    });

    // Recalculate agent's performance rating
    if (complaint.assignedAgentId) {
      const agentId = complaint.assignedAgentId;
      
      // Get all complaints of this agent that have feedback
      const agentComplaints = await Complaint.find({ assignedAgentId: agentId }, '_id');
      const complaintIds = agentComplaints.map(c => c._id);
      
      const feedbacks = await Feedback.find({ complaintId: { $in: complaintIds } });
      
      if (feedbacks.length > 0) {
        const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
        const avgScore = Number((sum / feedbacks.length).toFixed(1));
        
        await Agent.findOneAndUpdate(
          { userId: agentId },
          { performanceScore: avgScore }
        );
      }
    }

    res.status(201).json({
      success: true,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback by complaint ID
// @route   GET /api/feedback/complaint/:complaintId
// @access  Private
const getFeedbackByComplaint = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ complaintId: req.params.complaintId })
      .populate('userId', 'name avatar');

    if (!feedback) {
      return res.json({
        success: true,
        feedback: null,
      });
    }

    res.json({
      success: true,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  getFeedbackByComplaint,
};
