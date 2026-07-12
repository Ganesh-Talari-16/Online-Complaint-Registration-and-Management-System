const ChatMessage = require('../models/ChatMessage');
const Complaint = require('../models/Complaint');

// @desc    Get chat message logs for a complaint
// @route   GET /api/chat/:complaintId
// @access  Private
const getChatMessages = async (req, res, next) => {
  const { complaintId } = req.params;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    // Role access authorization check
    if (req.user.role === 'USER' && complaint.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access these chat logs');
    }

    if (req.user.role === 'AGENT' && (!complaint.assignedAgentId || complaint.assignedAgentId.toString() !== req.user._id.toString())) {
      res.status(403);
      throw new Error('Not authorized to access these chat logs');
    }

    const messages = await ChatMessage.find({ complaintId })
      .populate('senderId', 'name email avatar role')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark chat messages as read
// @route   PUT /api/chat/:complaintId/read
// @access  Private
const markAsRead = async (req, res, next) => {
  const { complaintId } = req.params;
  try {
    // Mark messages sent by the counterpart as read
    const roleToMark = req.user.role === 'USER' ? 'AGENT' : 'USER';
    
    await ChatMessage.updateMany(
      { complaintId, senderRole: roleToMark, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChatMessages,
  markAsRead,
};
