const express = require('express');
const router = express.Router();
const { can } = require('../middleware/authorize');
const ctrl = require('../controllers/posts');

router.get('/', can('posts:read'), ctrl.list);
router.post('/', can('posts:create'), ctrl.create);
router.get('/:id', can('posts:read'), ctrl.get);
router.put('/:id', can('posts:update'), ctrl.update);
router.delete('/:id', can('posts:delete'), ctrl.remove);
module.exports = router;
