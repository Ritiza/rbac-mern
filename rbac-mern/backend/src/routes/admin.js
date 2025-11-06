const express = require('express');
const router = express.Router();
const { can } = require('../middleware/authorize');
const ctrl = require('../controllers/admin');

router.use(can('admin:manage'));
router.get('/users', ctrl.listUsers);
router.put('/users/:id/role', ctrl.changeRole);

module.exports = router;
