// role -> capabilities
module.exports = {
  admin: ['*'],
  editor: [
    'posts:create',
    'posts:read',
    'posts:update',
    'posts:delete'
  ],
  viewer: [
    'posts:read'
  ]
};
