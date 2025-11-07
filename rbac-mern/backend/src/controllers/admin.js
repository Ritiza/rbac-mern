const User = require('../models/User');
const Post = require('../models/Post');
const AuditLog = require('../models/AuditLog');
const { logAuditEvent } = require('../utils/logger');
const { getEffectivePermissions } = require('../utils/authz');
const permissions = require('../config/permissions');

/**
 * List all users (admin only)
 */
exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch users',
      code: 'FETCH_ERROR'
    });
  }
};

/**
 * Get user by ID
 */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('createdBy', 'name email');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'NOT_FOUND'
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch user',
      code: 'FETCH_ERROR'
    });
  }
};

/**
 * Create new user (admin only)
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists',
        code: 'EMAIL_EXISTS'
      });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'viewer',
      createdBy: req.user.userId
    });

    await user.save();

    await logAuditEvent(req, 'admin:user:create', 'user', user._id, {
      email: user.email,
      role: user.role
    });

    const userResponse = user.toJSON();
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({
      error: error.message,
      code: 'CREATE_ERROR'
    });
  }
};

/**
 * Update user (admin only)
 */
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) {
      if (!['admin', 'editor', 'viewer'].includes(role)) {
        return res.status(400).json({
          error: 'Invalid role',
          code: 'INVALID_ROLE'
        });
      }
      updates.role = role;
    }
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'NOT_FOUND'
      });
    }

    await logAuditEvent(req, 'admin:user:update', 'user', user._id, updates);

    res.json(user);
  } catch (error) {
    res.status(400).json({
      error: error.message,
      code: 'UPDATE_ERROR'
    });
  }
};

/**
 * Assign role to user (admin only)
 */
exports.assignRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        code: 'INVALID_ROLE'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'NOT_FOUND'
      });
    }

    await logAuditEvent(req, 'admin:user:assign-role', 'user', user._id, {
      role
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({
      error: error.message,
      code: 'UPDATE_ERROR'
    });
  }
};

/**
 * Delete user (admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent self-deletion
    if (userId === req.user.userId.toString()) {
      return res.status(400).json({
        error: 'Cannot delete your own account',
        code: 'SELF_DELETE'
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'NOT_FOUND'
      });
    }

    await logAuditEvent(req, 'admin:user:delete', 'user', userId, {
      email: user.email,
      role: user.role
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete user',
      code: 'DELETE_ERROR'
    });
  }
};

/**
 * Get audit logs (admin only)
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action, resource, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch audit logs',
      code: 'FETCH_ERROR'
    });
  }
};

/**
 * Get authorization metrics
 */
exports.getAuthMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // Count authorization denials
    const denials = await AuditLog.countDocuments({
      ...dateFilter,
      action: 'authorization:denied'
    });

    // Count by status code
    const status401 = await AuditLog.countDocuments({
      ...dateFilter,
      statusCode: 401
    });
    const status403 = await AuditLog.countDocuments({
      ...dateFilter,
      statusCode: 403
    });

    // Count by action type
    const actionCounts = await AuditLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      authorizationDenials: denials,
      status401,
      status403,
      actionCounts
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch metrics',
      code: 'FETCH_ERROR'
    });
  }
};

/**
 * Get permissions for current user
 */
exports.getPermissions = async (req, res) => {
  try {
    const capabilities = getEffectivePermissions(req.user);
    const roleConfig = permissions.roles[req.user.role];

    res.json({
      role: req.user.role,
      roleName: roleConfig?.name,
      capabilities,
      permissions: capabilities.reduce((acc, cap) => {
        acc[cap] = permissions.permissions[cap] || cap;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch permissions',
      code: 'FETCH_ERROR'
    });
  }
};

/**
 * Get system stats (admin only)
 */
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const totalPosts = await Post.countDocuments();
    const postsByStatus = await Post.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentLogs = await AuditLog.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      users: {
        total: totalUsers,
        byRole: usersByRole
      },
      posts: {
        total: totalPosts,
        byStatus: postsByStatus
      },
      audit: {
        logsLast24h: recentLogs
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch stats',
      code: 'FETCH_ERROR'
    });
  }
};
