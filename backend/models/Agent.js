const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please add a specialization'],
      enum: ['Billing', 'Technical Support', 'Account Issues', 'Customer Service', 'Hardware', 'Other'],
      default: 'Other',
    },
    activeComplaints: {
      type: Number,
      default: 0,
    },
    resolvedComplaints: {
      type: Number,
      default: 0,
    },
    averageResolutionTime: {
      type: Number, // Stores average resolution time in minutes
      default: 0,
    },
    performanceScore: {
      type: Number, // Score out of 5 based on user feedback rating
      default: 5.0,
      min: 1.0,
      max: 5.0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
agentSchema.index({ specialization: 1 });

module.exports = mongoose.model('Agent', agentSchema);
