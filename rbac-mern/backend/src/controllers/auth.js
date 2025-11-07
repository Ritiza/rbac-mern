const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, revokeRefreshToken, revokeAllUserTokens } = require('../utils/jwt');
const { logAuditEvent } = require('../utils/logger');
const { authenticate } = require('../middleware/authorize');

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists',
        code: 'EMAIL_EXISTS'
      });
    }

    // Only admins can create users with specific roles
    const userRole = req.user?.role === 'admin' ? (role || 'viewer') : 'viewer';
    const createdBy = req.user?.userId || null;

    const user = new User({
      name,
      email,
      password,
      role: userRole,
      createdBy
    });

    await user.save();

    await logAuditEvent(req, 'user:create', 'user', user._id, {
      email: user.email,
      role: user.role,
      createdBy
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      code: 'REGISTRATION_ERROR'
    });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account is inactive',
        code: 'INACTIVE_ACCOUNT'
      });
    }

    if (!user.comparePassword(password)) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user, req);

    await logAuditEvent(req, 'auth:login', 'user', user._id, {
      email: user.email,
      role: user.role
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
};

/**
 * Refresh access token
 */
exports.refresh = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Refresh token required',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    const refreshTokenDoc = await verifyRefreshToken(token);
    const user = await User.findById(refreshTokenDoc.userId);

    if (!user || !user.isActive) {
      await revokeRefreshToken(token);
      return res.status(401).json({
        error: 'User account is inactive',
        code: 'INACTIVE_USER'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    await logAuditEvent(req, 'auth:refresh', 'user', user._id);

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({
      error: error.message || 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};

/**
 * Logout - revoke refresh token
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    if (req.user?.userId) {
      await logAuditEvent(req, 'auth:logout', 'user', req.user.userId);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = [
  authenticate,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select('-password');
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch profile',
        code: 'PROFILE_ERROR'
      });
    }
  }
];

/**
 * Update current user profile
 */
exports.updateProfile = [
  authenticate,
  async (req, res) => {
    try {
      const { name, email } = req.body;
      const updates = {};

      if (name) updates.name = name;
      if (email) updates.email = email;

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      await logAuditEvent(req, 'profile:update', 'user', user._id, updates);

      res.json(user);
    } catch (error) {
      res.status(400).json({
        error: error.message,
        code: 'UPDATE_ERROR'
      });
    }
  }
];

/**
 * Revoke all refresh tokens (logout from all devices)
 */
exports.logoutAll = [
  authenticate,
  async (req, res) => {
    try {
      await revokeAllUserTokens(req.user.userId);
      await logAuditEvent(req, 'auth:logout_all', 'user', req.user.userId);

      res.json({ message: 'Logged out from all devices' });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to logout from all devices',
        code: 'LOGOUT_ALL_ERROR'
      });
    }
  }
];
