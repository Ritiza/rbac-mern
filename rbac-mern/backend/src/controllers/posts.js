const Post = require('../models/Post');
const { buildQueryFilter, isOwner } = require('../utils/authz');
const { logAuditEvent } = require('../utils/logger');

/**
 * List posts with role-based filtering
 */
exports.list = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    // Build base filter
    let baseFilter = {};
    if (status) baseFilter.status = status;
    if (search) {
      baseFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }

    // Apply role-based filtering
    const filter = buildQueryFilter(req.user, baseFilter, 'posts');

    const posts = await Post.find(filter)
      .populate('authorId', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(filter);

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch posts',
      code: 'FETCH_ERROR'
    });
  }
};

/**
 * Get single post
 */
exports.get = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorId', 'name email')
      .populate('updatedBy', 'name email');

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        code: 'NOT_FOUND'
      });
    }

    // Check access with ownership filter
    const filter = buildQueryFilter(req.user, { _id: post._id }, 'posts');
    const accessible = await Post.findOne(filter);

    if (!accessible) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'FORBIDDEN'
      });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch post',
      code: 'FETCH_ERROR'
    });
  }
};

/**
 * Create new post
 */
exports.create = async (req, res) => {
  try {
    const { title, body, status, tags } = req.body;

    const post = new Post({
      title,
      body,
      status: status || 'published',
      tags: tags || [],
      authorId: req.user.userId,
      updatedBy: req.user.userId
    });

    await post.save();
    await post.populate('authorId', 'name email');

    await logAuditEvent(req, 'post:create', 'post', post._id, {
      title: post.title,
      status: post.status
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({
      error: error.message,
      code: 'CREATE_ERROR'
    });
  }
};

/**
 * Update post (with ownership check)
 */
exports.update = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        code: 'NOT_FOUND'
      });
    }

    // Check ownership (admins can update any post)
    if (!isOwner(req.user, post)) {
      return res.status(403).json({
        error: 'You can only update your own posts',
        code: 'FORBIDDEN_OWNERSHIP'
      });
    }

    const { title, body, status, tags } = req.body;
    const changes = {};

    if (title !== undefined) changes.title = title;
    if (body !== undefined) changes.body = body;
    if (status !== undefined) changes.status = status;
    if (tags !== undefined) changes.tags = tags;

    changes.updatedBy = req.user.userId;
    changes.updatedAt = new Date();

    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      changes,
      { new: true, runValidators: true }
    ).populate('authorId', 'name email').populate('updatedBy', 'name email');

    await logAuditEvent(req, 'post:update', 'post', post._id, changes);

    res.json(updated);
  } catch (error) {
    res.status(400).json({
      error: error.message,
      code: 'UPDATE_ERROR'
    });
  }
};

/**
 * Delete post (with ownership check)
 */
exports.remove = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        code: 'NOT_FOUND'
      });
    }

    // Check ownership (admins can delete any post)
    if (!isOwner(req.user, post)) {
      return res.status(403).json({
        error: 'You can only delete your own posts',
        code: 'FORBIDDEN_OWNERSHIP'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    await logAuditEvent(req, 'post:delete', 'post', post._id, {
      title: post.title
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete post',
      code: 'DELETE_ERROR'
    });
  }
};

/**
 * Get user's own posts
 */
exports.getMyPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { authorId: req.user.userId };
    if (req.query.status) filter.status = req.query.status;

    const posts = await Post.find(filter)
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(filter);

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch posts',
      code: 'FETCH_ERROR'
    });
  }
};
