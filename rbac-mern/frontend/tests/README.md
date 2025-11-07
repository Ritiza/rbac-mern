# RBAC Frontend Tests

Basic test structure for the RBAC frontend.

## Running Tests

```bash
npm test
```

## Test Structure

- `src/components/__tests__/` - Component tests
- `src/hooks/__tests__/` - Hook tests
- `src/pages/__tests__/` - Page tests

## Example Test

```javascript
import { render, screen } from '@testing-library/react';
import Login from '../pages/Login';

test('renders login form', () => {
  render(<Login />);
  const emailInput = screen.getByPlaceholderText(/email/i);
  expect(emailInput).toBeInTheDocument();
});
```

