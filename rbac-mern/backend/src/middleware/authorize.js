const { verifyAccessToken } = require('../utils/jwt');
const permissions = require('../config/permissions');
const { logAuthorizationDenial } = require('../utils/logger');
const User = require('../models/User');

/**
 * Authenticate user via JWT token
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // Fetch user to ensure they're still active
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'User account is inactive',
        code: 'INACTIVE_USER'
      });
    }

    req.user = {
      userId: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * Authorization middleware - check if user has required capability
 */
function can(capability) {
  return [
    authenticate,
    async (req, res, next) => {
      const userRole = req.user?.role;
      
      if (!userRole) {
        await logAuthorizationDenial(req, capability, 'No user role');
        return res.status(403).json({
          error: 'Forbidden: No permission',
          code: 'FORBIDDEN',
          required: capability
        });
      }

      const hasPermission = permissions.hasCapability(userRole, capability);
      
      if (!hasPermission) {
        await logAuthorizationDenial(req, capability, `Role ${userRole} lacks capability ${capability}`);
        return res.status(403).json({
          error: 'Forbidden: Insufficient permissions',
          code: 'FORBIDDEN',
          required: capability,
          role: userRole
        });
      }

      next();
    }
  ];
}

/**
 * Check ownership middleware - ensures user owns the resource
 */
function requireOwnership(resourceGetter) {
  return [
    authenticate,
    async (req, res, next) => {
      try {
        const resource = await resourceGetter(req);
        
        if (!resource) {
          return res.status(404).json({
            error: 'Resource not found',
            code: 'NOT_FOUND'
          });
        }

        const { isOwner } = require('../utils/authz');
        const ownsResource = isOwner(req.user, resource);

        if (!ownsResource && req.user.role !== 'admin') {
          await logAuthorizationDenial(req, 'ownership', 'User does not own resource');
          return res.status(403).json({
            error: 'Forbidden: You can only modify your own resources',
            code: 'FORBIDDEN_OWNERSHIP'
          });
        }

        req.resource = resource;
        next();
      } catch (error) {
        return res.status(500).json({
          error: 'Error checking ownership',
          code: 'SERVER_ERROR'
        });
      }
    }
  ];
}

/**
 * Optional authentication - sets req.user if token present, but doesn't fail if missing
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      role: payload.role,
      email: payload.email
    };
  } catch (error) {
    // Silently fail for optional auth
  }
  
  next();
}

module.exports = {
  authenticate,
  can,
  requireOwnership,
  optionalAuth
};

