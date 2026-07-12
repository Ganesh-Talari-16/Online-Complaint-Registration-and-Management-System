const Agent = require('../models/Agent');
const User = require('../models/User');

// @desc    Get all agents with profile details (for ADMIN assignment & rankings)
// @route   GET /api/agents
// @access  Private (ADMIN only)
const getAgents = async (req, res, next) => {
  try {
    const agents = await Agent.find()
      .populate('userId', 'name email phone avatar isVerified')
      .exec();

    res.json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update agent profile / specialization
// @route   PUT /api/agents/:id
// @access  Private (ADMIN only)
const updateAgentProfile = async (req, res, next) => {
  const { specialization } = req.body;
  try {
    const agent = await Agent.findOne({ userId: req.params.id });
    if (!agent) {
      res.status(404);
      throw new Error('Agent profile not found');
    }

    agent.specialization = specialization || agent.specialization;
    await agent.save();

    res.json({
      success: true,
      message: 'Agent specialization updated successfully',
      agent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current agent metrics
// @route   GET /api/agents/me/metrics
// @access  Private (AGENT role only)
const getAgentMetrics = async (req, res, next) => {
  try {
    const agentStats = await Agent.findOne({ userId: req.user._id })
      .populate('userId', 'name email avatar');

    if (!agentStats) {
      res.status(404);
      throw new Error('Agent profile not found');
    }

    res.json({
      success: true,
      metrics: agentStats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAgents,
  updateAgentProfile,
  getAgentMetrics,
};
