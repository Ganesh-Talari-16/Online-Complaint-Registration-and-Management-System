const express = require('express');
const router = express.Router();
const { getAgents, updateAgentProfile, getAgentMetrics } = require('../controllers/agentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Admin-only routing to see and adjust agents
router.get('/', protect, authorize('ADMIN'), getAgents);
router.put('/:id', protect, authorize('ADMIN'), updateAgentProfile);

// Agent performance dashboard
router.get('/me/metrics', protect, authorize('AGENT'), getAgentMetrics);

module.exports = router;
