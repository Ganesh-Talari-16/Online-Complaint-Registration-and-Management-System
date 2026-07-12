const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['USER', 'AGENT'],
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message body cannot be empty'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // This automatically provides createdAt (timestamp) and updatedAt
  }
);

// Indexes
chatMessageSchema.index({ complaintId: 1 });
chatMessageSchema.index({ createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
