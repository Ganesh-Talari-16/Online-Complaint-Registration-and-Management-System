const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  getAllUsers,
  deleteUser,
  updateUserRole,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Admin-only User management routes
router.get('/users', protect, authorize('ADMIN'), getAllUsers);
router.put('/users/:id/role', protect, authorize('ADMIN'), updateUserRole);
router.delete('/users/:id', protect, authorize('ADMIN'), deleteUser);

module.exports = router;
