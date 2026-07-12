const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Agent = require('../models/Agent');

// @desc    Get dashboard analytics based on user role
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === 'USER') {
      const userId = req.user._id;

      const total = await Complaint.countDocuments({ userId });
      const pending = await Complaint.countDocuments({ userId, status: 'Pending' });
      const inProgress = await Complaint.countDocuments({ userId, status: 'In Progress' });
      const resolved = await Complaint.countDocuments({ userId, status: { $in: ['Resolved', 'Closed'] } });
      const recent = await Complaint.find({ userId })
        .populate('assignedAgentId', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.json({
        success: true,
        data: {
          role,
          stats: { total, pending, inProgress, resolved },
          recent,
        },
      });
    }

    if (role === 'AGENT') {
      const agentId = req.user._id;

      const agentProfile = await Agent.findOne({ userId: agentId });
      const assigned = await Complaint.countDocuments({
        assignedAgentId: agentId,
        status: { $in: ['Assigned', 'In Progress', 'Reopened'] },
      });
      const resolved = await Complaint.countDocuments({
        assignedAgentId: agentId,
        status: { $in: ['Resolved', 'Closed'] },
      });
      
      const recent = await Complaint.find({ assignedAgentId: agentId })
        .populate('userId', 'name avatar')
        .sort({ updatedAt: -1 })
        .limit(5);

      return res.json({
        success: true,
        data: {
          role,
          stats: {
            assigned,
            resolved,
            averageResolutionTime: agentProfile ? agentProfile.averageResolutionTime : 0,
            performanceScore: agentProfile ? agentProfile.performanceScore : 5.0,
          },
          recent,
        },
      });
    }

    if (role === 'ADMIN') {
      // 1. Core counters
      const totalUsers = await User.countDocuments({ role: 'USER' });
      const totalAgents = await User.countDocuments({ role: 'AGENT' });
      const totalComplaints = await Complaint.countDocuments();
      
      // Status breakdowns
      const pending = await Complaint.countDocuments({ status: 'Pending' });
      const assigned = await Complaint.countDocuments({ status: 'Assigned' });
      const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
      const resolved = await Complaint.countDocuments({ status: 'Resolved' });
      const closed = await Complaint.countDocuments({ status: 'Closed' });
      const reopened = await Complaint.countDocuments({ status: 'Reopened' });

      // 2. Category distribution
      const categoryBreakdown = await Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);

      // 3. Monthly complaint trends (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const monthlyTrends = await Complaint.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
            resolved: {
              $sum: {
                $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0],
              },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      // Formatting monthly trends for ChartJS/Recharts
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedTrends = monthlyTrends.map((trend) => {
        return {
          month: `${monthNames[trend._id.month - 1]} ${trend._id.year}`,
          complaints: trend.count,
          resolved: trend.resolved,
        };
      });

      // 4. Agent rankings
      const agentRankings = await Agent.find()
        .populate('userId', 'name email avatar')
        .sort({ performanceScore: -1, resolvedComplaints: -1 })
        .limit(5);

      // 5. Overall Resolution stats
      const allAgents = await Agent.find();
      const avgResTimeArr = allAgents.map(a => a.averageResolutionTime).filter(t => t > 0);
      const avgResolutionTime = avgResTimeArr.length > 0 
        ? Math.round(avgResTimeArr.reduce((a, b) => a + b, 0) / avgResTimeArr.length) 
        : 0;

      return res.json({
        success: true,
        data: {
          role,
          stats: {
            totalUsers,
            totalAgents,
            totalComplaints,
            statusCounts: { pending, assigned, inProgress, resolved, closed, reopened },
            avgResolutionTime,
          },
          categoryBreakdown: categoryBreakdown.map(item => ({ category: item._id, count: item.count })),
          monthlyTrends: formattedTrends,
          agentRankings,
        },
      });
    }

    res.status(400);
    throw new Error('Invalid user role');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
};
