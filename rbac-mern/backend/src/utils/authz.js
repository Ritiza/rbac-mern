const permissions = require('../config/permissions');

/**
 * Apply ownership filter to MongoDB queries based on user role
 * Admins see everything, Editors see only their own, Viewers see all (read-only)
 */
function ownershipFilter(user, baseFilter = {}) {
  if (!user) {
    return { ...baseFilter, _id: null }; // No access
  }

  if (user.role === 'admin') {
    return baseFilter; // Admins see everything
  }

  if (user.role === 'editor') {
    // Editors only see their own documents
    return { ...baseFilter, authorId: user.userId };
  }

  // Viewers can read all (ownership handled by capabilities)
  return baseFilter;
}

/**
 * Check if user owns a resource
 */
function isOwner(user, resource) {
  if (!user || !resource) return false;
  if (user.role === 'admin') return true;
  
  const resourceAuthorId = resource.authorId?.toString() || resource.authorId;
  const userId = user.userId?.toString() || user.userId;
  
  return resourceAuthorId === userId;
}

/**
 * Build query filter with ownership and role-based scoping
 */
function buildQueryFilter(user, baseFilter = {}, resourceType = 'posts') {
  const filter = ownershipFilter(user, baseFilter);
  
  // Additional role-based filters can be added here
  if (resourceType === 'posts' && user.role === 'viewer') {
    // Viewers might only see published posts
    filter.status = filter.status || 'published';
  }
  
  return filter;
}

/**
 * Get effective permissions for a user
 */
function getEffectivePermissions(user) {
  if (!user || !user.role) return [];
  return permissions.getCapabilities(user.role);
}

module.exports = {
  ownershipFilter,
  isOwner,
  buildQueryFilter,
  getEffectivePermissions
};

