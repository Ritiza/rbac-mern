const { v4: uuidv4 } = require('uuid');
const AuditLog = require('../models/AuditLog');

/**
 * Generate correlation ID for request tracking
 */
function generateCorrelationId() {
  return uuidv4();
}

/**
 * Structured request logger middleware
 */
function requestLogger(req, res, next) {
  req.correlationId = req.headers['x-correlation-id'] || generateCorrelationId();
  res.setHeader('X-Correlation-ID', req.correlationId);

  const startTime = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      correlationId: req.correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };

    if (req.user) {
      logData.userId = req.user.userId;
    }

    // Log to console (structured)
    console.log(JSON.stringify({
      level: res.statusCode >= 400 ? 'error' : 'info',
      ...logData,
      timestamp: new Date().toISOString()
    }));
  });

  next();
}

/**
 * Log authorization denial
 */
async function logAuthorizationDenial(req, capability, reason) {
  try {
    await AuditLog.create({
      correlationId: req.correlationId,
      userId: req.user?.userId,
      action: 'authorization:denied',
      resource: capability,
      method: req.method,
      path: req.path,
      statusCode: 403,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      metadata: {
        reason,
        capability,
        userRole: req.user?.role
      }
    });
  } catch (error) {
    console.error('Failed to log authorization denial:', error);
  }
}

/**
 * Log audit event
 */
async function logAuditEvent(req, action, resource, resourceId, changes = null) {
  try {
    await AuditLog.create({
      correlationId: req.correlationId,
      userId: req.user?.userId,
      action,
      resource,
      resourceId,
      method: req.method,
      path: req.path,
      statusCode: req.res?.statusCode,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      changes,
      metadata: {
        userRole: req.user?.role
      }
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

module.exports = {
  generateCorrelationId,
  requestLogger,
  logAuthorizationDenial,
  logAuditEvent
};
