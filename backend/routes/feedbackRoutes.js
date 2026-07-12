const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedbackByComplaint } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('USER'), submitFeedback);
router.get('/complaint/:complaintId', protect, getFeedbackByComplaint);

module.exports = router;
