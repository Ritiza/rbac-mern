/**
 * Role & Permission Matrix
 * Defines capabilities per role for fine-grained access control
 */

module.exports = {
  roles: {
    admin: {
      name: 'Admin',
      description: 'Full system access',
      capabilities: ['*'] // Wildcard for all permissions
    },
    editor: {
      name: 'Editor',
      description: 'Can create and manage own content',
      capabilities: [
        'posts:create',
        'posts:read',
        'posts:update',
        'posts:delete',
        'profile:read',
        'profile:update'
      ]
    },
    viewer: {
      name: 'Viewer',
      description: 'Read-only access',
      capabilities: [
        'posts:read',
        'profile:read'
      ]
    }
  },

  // Permission definitions
  permissions: {
    'posts:create': 'Create new posts',
    'posts:read': 'View posts',
    'posts:update': 'Update posts',
    'posts:delete': 'Delete posts',
    'users:read': 'View users',
    'users:create': 'Create users',
    'users:update': 'Update users',
    'users:delete': 'Delete users',
    'users:assign-role': 'Assign roles to users',
    'admin:access': 'Access admin panel',
    'admin:manage': 'Manage admin functions',
    'admin:audit': 'View audit logs',
    'profile:read': 'View own profile',
    'profile:update': 'Update own profile'
  },

  /**
   * Check if a role has a specific capability
   */
  hasCapability(role, capability) {
    const roleConfig = this.roles[role];
    if (!roleConfig) return false;
    
    const capabilities = roleConfig.capabilities;
    return capabilities.includes('*') || capabilities.includes(capability);
  },

  /**
   * Get all capabilities for a role
   */
  getCapabilities(role) {
    const roleConfig = this.roles[role];
    return roleConfig ? roleConfig.capabilities : [];
  }
};

