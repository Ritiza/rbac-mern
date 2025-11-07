const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index for auto-deletion
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  revoked: {
    type: Boolean,
    default: false
  },
  ipAddress: String,
  userAgent: String
});

// Index for efficient queries
refreshTokenSchema.index({ userId: 1, revoked: 1 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);

