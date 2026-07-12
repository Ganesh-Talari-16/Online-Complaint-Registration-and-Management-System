const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Agent = require('../models/Agent');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwttokenthingy12345', {
    expiresIn: '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Assign registration token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create user. Limit role to USER or AGENT. Admins must be created manually or via DB seed
    const userRole = role === 'ADMIN' ? 'USER' : (role || 'USER');

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
      verificationToken,
    });

    if (user) {
      // If user is AGENT, initialize agent profile
      if (user.role === 'AGENT') {
        await Agent.create({
          userId: user._id,
          specialization: 'Other',
        });
      }

      // Send verification email (async, doesn't block)
      sendVerificationEmail(user.email, verificationToken, user.name);

      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user with password included
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email successfully verified. You can now use all features.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('No user found with that email address');
    }

    // Create reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    await sendResetPasswordEmail(user.email, resetToken, user.name);

    res.json({
      success: true,
      message: 'Reset password link sent to email',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired reset token');
    }

    user.password = password; // pre-save hook will hash
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      
      if (req.body.avatar) {
        user.avatar = req.body.avatar;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          isVerified: updatedUser.isVerified,
        },
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (ADMIN only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (ADMIN only)
const deleteUser = async (req, res, next) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      res.status(404);
      throw new Error('User not found');
    }

    if (userToDelete._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own admin account');
    }

    await User.findByIdAndDelete(req.params.id);
    // If it was an agent, delete agent profile
    if (userToDelete.role === 'AGENT') {
      await Agent.findOneAndDelete({ userId: req.params.id });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/auth/users/:id/role
// @access  Private (ADMIN only)
const updateUserRole = async (req, res, next) => {
  const { role } = req.body;
  try {
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      res.status(404);
      throw new Error('User not found');
    }

    const oldRole = userToUpdate.role;
    userToUpdate.role = role;
    await userToUpdate.save();

    // If role changed to AGENT, ensure agent profile exists
    if (role === 'AGENT' && oldRole !== 'AGENT') {
      const agentProfile = await Agent.findOne({ userId: userToUpdate._id });
      if (!agentProfile) {
        await Agent.create({
          userId: userToUpdate._id,
          specialization: 'Other',
        });
      }
    }

    // If role changed from AGENT to USER, delete agent profile
    if (oldRole === 'AGENT' && role !== 'AGENT') {
      await Agent.findOneAndDelete({ userId: userToUpdate._id });
    }

    res.json({
      success: true,
      message: `User role updated successfully from ${oldRole} to ${role}`,
      user: userToUpdate,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
