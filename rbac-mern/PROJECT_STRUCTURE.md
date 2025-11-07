# Project Directory Structure

```
rbac-mern/
│
├── backend/                          # Node.js/Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── permissions.js        # Role & permission matrix configuration
│   │   │
│   │   ├── controllers/              # Request handlers
│   │   │   ├── admin.js             # Admin operations (users, audit, stats)
│   │   │   ├── auth.js              # Authentication (login, register, refresh)
│   │   │   └── posts.js              # Post CRUD operations
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   ├── authorize.js          # JWT auth & permission checks
│   │   │   └── validation.js         # Input validation & sanitization
│   │   │
│   │   ├── models/                   # Mongoose models
│   │   │   ├── AuditLog.js          # Audit log model
│   │   │   ├── Post.js               # Post model with indexes
│   │   │   ├── RefreshToken.js       # Refresh token model (TTL)
│   │   │   └── User.js               # User model with password hashing
│   │   │
│   │   ├── routes/                   # API routes
│   │   │   ├── index.js             # Route aggregator
│   │   │   ├── admin.js             # Admin routes (/api/admin/*)
│   │   │   ├── auth.js              # Auth routes (/api/auth/*)
│   │   │   └── posts.js             # Post routes (/api/posts/*)
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── authz.js             # Authorization helpers (ownership, filters)
│   │   │   ├── jwt.js                # JWT token generation & verification
│   │   │   ├── logger.js             # Structured logging & audit
│   │   │   ├── roles.js              # Legacy roles (deprecated, use permissions.js)
│   │   │   └── seed.js               # Database seeding script
│   │   │
│   │   └── index.js                   # Express server entry point
│   │
│   ├── tests/                        # Test files
│   │   └── README.md                # Test documentation
│   │
│   ├── .env.example                  # Environment variables template
│   ├── Dockerfile                    # Docker image for backend
│   ├── package.json                  # Dependencies & scripts
│   └── package-lock.json            # Locked dependencies
│
├── frontend/                         # React Frontend
│   ├── public/
│   │   └── index.html                # HTML template
│   │
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   └── ProtectedRoute.jsx  # Route guard component
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useAuth.jsx         # Authentication context & hook
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── AdminPanel.jsx      # Admin panel (users, audit, stats)
│   │   │   ├── Dashboard.jsx       # Main dashboard (post list)
│   │   │   ├── Login.jsx           # Login page
│   │   │   └── PostForm.jsx        # Create/edit post form
│   │   │
│   │   ├── App.jsx                  # Main app component & routing
│   │   └── index.jsx                # React entry point
│   │
│   ├── tests/                        # Test files
│   │   └── README.md                # Test documentation
│   │
│   ├── .env.example                  # Environment variables template
│   ├── Dockerfile                    # Docker image for frontend
│   ├── package.json                  # Dependencies & scripts
│   └── package-lock.json            # Locked dependencies
│
├── .gitignore                        # Git ignore rules
├── docker-compose.yml                # Docker Compose configuration
└── README.md                         # Project documentation
```

## Key Files Explained

### Backend

**config/permissions.js**
- Defines role capabilities matrix
- Permission definitions
- Helper functions for permission checks

**controllers/**
- Handle HTTP requests
- Business logic
- Call models and utilities

**middleware/authorize.js**
- JWT authentication
- Permission checking (`can()`)
- Ownership verification (`requireOwnership()`)

**middleware/validation.js**
- Input validation using express-validator
- Sanitization
- Error handling

**models/**
- Mongoose schemas
- Database indexes
- Model methods

**utils/authz.js**
- Ownership filtering for MongoDB queries
- Role-based query building
- Permission helpers

**utils/jwt.js**
- Access token generation
- Refresh token management
- Token verification

**utils/logger.js**
- Structured logging
- Correlation ID generation
- Audit log creation

**utils/seed.js**
- Database seeding script
- Creates sample users and posts

### Frontend

**components/ProtectedRoute.jsx**
- Route guard component
- Checks authentication
- Checks permissions

**hooks/useAuth.jsx**
- Authentication context provider
- Token management
- Permission checking
- Auto token refresh

**pages/**
- Page-level components
- Route handlers
- UI logic

## Database Collections

- `users` - User accounts with roles
- `posts` - Blog posts/content
- `refreshtokens` - Refresh tokens (TTL indexed)
- `auditlogs` - Audit trail of all actions

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 4000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT signing
- `ACCESS_TOKEN_EXPIRES_IN` - Access token TTL
- `REFRESH_TOKEN_EXPIRES_IN` - Refresh token TTL
- `FRONTEND_URL` - CORS allowed origin

### Frontend (.env)
- `REACT_APP_API` - Backend API URL

