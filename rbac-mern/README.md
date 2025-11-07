# RBAC MERN Application

A comprehensive Role-Based Access Control (RBAC) system built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with short-lived access tokens (15min) and refresh tokens (7 days)
- **Fine-grained RBAC** with three roles: Admin, Editor, Viewer
- **Permission matrix** defining capabilities per role
- **Ownership checks** - Editors can only modify their own content
- **Route-level and component-level guards** in React

### 🛡️ Security
- **Input validation** using express-validator
- **Rate limiting** on API endpoints (100 req/15min, 5 req/15min for auth)
- **Helmet.js** for security headers
- **CORS** configuration
- **Password hashing** with bcryptjs
- **Secure token storage** with httpOnly cookies support

### 📊 Observability
- **Structured logging** with correlation IDs
- **Audit logging** for all user actions
- **Authorization metrics** tracking 401/403 responses
- **Request tracing** with correlation IDs

### 🎨 Frontend
- **Modern React UI** with Tailwind CSS
- **Route guards** protecting pages based on permissions
- **Permission-based UI** - buttons/menus hidden/disabled based on role
- **Admin panel** for user management
- **Audit log viewer** for admins
- **Responsive design**

### 🗄️ Database
- **MongoDB** with optimized indexes
- **Query-level filtering** based on role and ownership
- **TTL indexes** for automatic token cleanup
- **Compound indexes** for performance

## Project Structure

```
rbac-mern/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── permissions.js      # Role & permission matrix
│   │   ├── controllers/
│   │   │   ├── admin.js            # Admin operations
│   │   │   ├── auth.js             # Authentication
│   │   │   └── posts.js            # Post CRUD
│   │   ├── middleware/
│   │   │   ├── authorize.js        # Auth & authorization middleware
│   │   │   └── validation.js      # Input validation
│   │   ├── models/
│   │   │   ├── User.js             # User model
│   │   │   ├── Post.js             # Post model
│   │   │   ├── RefreshToken.js    # Refresh token model
│   │   │   └── AuditLog.js        # Audit log model
│   │   ├── routes/
│   │   │   ├── index.js           # Route aggregator
│   │   │   ├── auth.js            # Auth routes
│   │   │   ├── posts.js           # Post routes
│   │   │   └── admin.js           # Admin routes
│   │   ├── utils/
│   │   │   ├── jwt.js             # JWT utilities
│   │   │   ├── authz.js           # Authorization helpers
│   │   │   ├── logger.js          # Logging utilities
│   │   │   └── seed.js            # Database seeding
│   │   └── index.js               # Express server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   └── ProtectedRoute.jsx # Route guard component
│   │   ├── hooks/
│   │   │   └── useAuth.jsx        # Auth context hook
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Dashboard.jsx     # Main dashboard
│   │   │   ├── AdminPanel.jsx    # Admin panel
│   │   │   └── PostForm.jsx      # Post create/edit form
│   │   ├── App.jsx               # Main app component
│   │   └── index.jsx             # Entry point
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (or use Docker)
- Docker & Docker Compose (optional)

### Local Development

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Edit .env with your settings
npm run seed          # Seed database with sample users
npm run dev           # Start development server
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Edit .env with API URL
npm start             # Start development server
```

### Docker Setup
```bash
# Build and start all services
docker-compose up --build

# Run seed script (in a separate terminal)
docker-compose exec api node src/utils/seed.js
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- MongoDB: localhost:27017

## Demo Credentials

After running the seed script, you can login with:

- **Admin**: `admin@example.com` / `Admin123!`
- **Editor**: `editor@example.com` / `Editor123!`
- **Viewer**: `viewer@example.com` / `Viewer123!`

## Role & Permission Matrix

### Admin
- Full system access (`*` wildcard)
- Can manage all users
- Can view/edit/delete all posts
- Access to admin panel and audit logs

### Editor
- `posts:create` - Create new posts
- `posts:read` - View posts
- `posts:update` - Update own posts only
- `posts:delete` - Delete own posts only
- `profile:read` - View own profile
- `profile:update` - Update own profile

### Viewer
- `posts:read` - View published posts only
- `profile:read` - View own profile

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile

### Posts
- `GET /api/posts` - List posts (filtered by role)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (requires `posts:create`)
- `PUT /api/posts/:id` - Update post (requires `posts:update` + ownership)
- `DELETE /api/posts/:id` - Delete post (requires `posts:delete` + ownership)
- `GET /api/posts/my` - Get current user's posts

### Admin (requires `admin:access`)
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `PUT /api/admin/users/:id/role` - Assign role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/audit` - Get audit logs
- `GET /api/admin/metrics` - Get authorization metrics
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/permissions` - Get current user permissions

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Security Considerations

1. **Change JWT_SECRET** in production
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** in production
4. **Configure CORS** properly for your domain
5. **Set up rate limiting** appropriate for your use case
6. **Regular security audits** of dependencies
7. **Monitor audit logs** for suspicious activity

## Development

### Adding New Permissions

1. Update `backend/src/config/permissions.js`:
```javascript
permissions: {
  'new:permission': 'Description of permission'
}
```

2. Add to role capabilities:
```javascript
editor: {
  capabilities: [
    // ... existing
    'new:permission'
  ]
}
```

3. Use in routes:
```javascript
router.post('/new-route', can('new:permission'), controller);
```

### Adding New Roles

1. Add role to `backend/src/config/permissions.js`
2. Update User model enum if needed
3. Update frontend role display logic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or as a starter template.

## Support

For issues and questions, please open an issue on GitHub.
