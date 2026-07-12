const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: ['Billing', 'Technical Support', 'Account Issues', 'Customer Service', 'Hardware', 'Other'],
      default: 'Other',
    },
    priority: {
      type: String,
      required: [true, 'Please specify a priority'],
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    attachments: [
      {
        type: String, // URLs or paths to uploaded files
      },
    ],
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Reopened'],
      default: 'Pending',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionSummary: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization
complaintSchema.index({ userId: 1 });
complaintSchema.index({ assignedAgentId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
