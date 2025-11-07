# RBAC Backend Tests

Basic test structure for the RBAC backend.

## Running Tests

```bash
npm test
```

## Test Structure

- `tests/unit/` - Unit tests for utilities and middleware
- `tests/integration/` - Integration tests for API endpoints
- `tests/e2e/` - End-to-end tests for complete flows

## Example Test

```javascript
const request = require('supertest');
const app = require('../src/index');

describe('Auth Endpoints', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin123!'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});
```

