const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const RefreshToken = require('../models/RefreshToken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_change_in_production';
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate access token (short-lived)
 */
function generateAccessToken(user) {
  const payload = {
    userId: user._id || user.id,
    role: user.role,
    email: user.email
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: 'rbac-mern-api',
    audience: 'rbac-mern-client'
  });
}

/**
 * Generate refresh token (long-lived, stored in DB)
 */
async function generateRefreshToken(user, req) {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days default

  const refreshToken = new RefreshToken({
    token,
    userId: user._id || user.id,
    expiresAt,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  });

  await refreshToken.save();
  return token;
}

/**
 * Verify access token
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'rbac-mern-api',
      audience: 'rbac-mern-client'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify and revoke refresh token
 */
async function verifyRefreshToken(token) {
  const refreshToken = await RefreshToken.findOne({
    token,
    revoked: false,
    expiresAt: { $gt: new Date() }
  });

  if (!refreshToken) {
    throw new Error('Invalid or expired refresh token');
  }

  return refreshToken;
}

/**
 * Revoke refresh token
 */
async function revokeRefreshToken(token) {
  await RefreshToken.updateOne(
    { token },
    { revoked: true }
  );
}

/**
 * Revoke all refresh tokens for a user
 */
async function revokeAllUserTokens(userId) {
  await RefreshToken.updateMany(
    { userId, revoked: false },
    { revoked: true }
  );
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens
};

