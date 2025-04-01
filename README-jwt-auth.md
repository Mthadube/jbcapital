# JWT Authentication Implementation

This document outlines the JWT-based authentication system implemented for the JB Capital application.

## Features

- **User Authentication**: Secure login using JWT tokens
- **Password Security**: Passwords are hashed using bcrypt before storage
- **Token-based Sessions**: Stateless authentication using JWT
- **Role-based Access Control**: Different access levels for admin and regular users
- **Protected Routes**: API endpoints secured with authentication middleware
- **Token Validation**: Server-side validation of token authenticity

## API Endpoints

### Authentication

- `POST /api/auth/login` - Authenticate user and get JWT token
- `POST /api/auth/register` - Register new user
- `POST /api/auth/validate` - Validate JWT token
- `POST /api/auth/change-password` - Change user password

### Protected Routes

All protected API routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Implementation Details

1. **Token Generation**: JWTs are signed using a secret key and include user ID, email, and role
2. **Token Expiry**: Tokens expire after 24 hours by default
3. **Password Security**: Passwords are hashed with bcrypt using a salt factor of 10
4. **Middleware**: Authentication is enforced using custom middleware

## Security Considerations

- JWT secret is stored in environment variables, not in code
- Password hashing occurs automatically through Mongoose middleware
- Role-based authorization is enforced on all sensitive routes
- Protected routes perform token validation on every request
- Token expiration limits the window of opportunity for token misuse

## Frontend Integration

The frontend application stores the JWT token in localStorage and includes it in the Authorization header for all API requests. The token is checked on startup and when accessing protected routes.

## Development Notes

- Never expose the JWT secret in client-side code
- Always validate user permissions server-side, not just client-side
- Remove the temporary admin password reset route before deployment to production 