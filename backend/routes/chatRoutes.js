const express = require('express');
const router = express.Router();
const { getChatMessages, markAsRead } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:complaintId', protect, getChatMessages);
router.put('/:complaintId/read', protect, markAsRead);

module.exports = router;
