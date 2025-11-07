const express = require('express');
const router = express.Router();
const { can, authenticate } = require('../middleware/authorize');
const { validatePost, sanitizeInput } = require('../middleware/validation');
const ctrl = require('../controllers/posts');

// Public read access (optional auth for personalized results)
router.get('/', authenticate, ctrl.list);

// Protected routes
router.post('/', authenticate, sanitizeInput, validatePost, can('posts:create'), ctrl.create);
router.get('/my', authenticate, ctrl.getMyPosts);
router.get('/:id', authenticate, can('posts:read'), ctrl.get);
router.put('/:id', authenticate, sanitizeInput, validatePost, can('posts:update'), ctrl.update);
router.delete('/:id', authenticate, can('posts:delete'), ctrl.remove);

module.exports = router;
