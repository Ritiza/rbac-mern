const express = require('express');
const router = express.Router();
const { can, authenticate } = require('../middleware/authorize');
const { validateUserUpdate, sanitizeInput } = require('../middleware/validation');
const ctrl = require('../controllers/admin');

// All admin routes require admin access
router.use(authenticate);
router.use(can('admin:access'));

// User management
router.get('/users', ctrl.listUsers);
router.get('/users/:id', ctrl.getUser);
router.post('/users', sanitizeInput, validateUserUpdate, ctrl.createUser);
router.put('/users/:id', sanitizeInput, validateUserUpdate, ctrl.updateUser);
router.put('/users/:id/role', sanitizeInput, ctrl.assignRole);
router.delete('/users/:id', ctrl.deleteUser);

// Audit logs
router.get('/audit', ctrl.getAuditLogs);
router.get('/metrics', ctrl.getAuthMetrics);

// System info
router.get('/stats', ctrl.getStats);
router.get('/permissions', ctrl.getPermissions);

module.exports = router;
