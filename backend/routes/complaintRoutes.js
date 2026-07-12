const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignAgent,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validateComplaint } = require('../validators/complaintValidator');

// Submitting a complaint requires USER role and supports uploading up to 5 files
router.post(
  '/',
  protect,
  authorize('USER'),
  upload.array('attachments', 5),
  validateComplaint,
  createComplaint
);

// General complaint queries
router.get('/', protect, getComplaints);
router.get('/:id', protect, getComplaintById);

// Status workflows
router.put('/:id/status', protect, updateComplaintStatus);

// Admin-only assignments
router.put('/:id/assign', protect, authorize('ADMIN'), assignAgent);

module.exports = router;
