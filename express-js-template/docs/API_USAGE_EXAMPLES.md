# Swagger API Documentation Usage Examples

This document provides practical examples of using the API with the Swagger documentation.

## Getting Started

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Access Swagger UI**:

   - Open browser: `http://localhost:3000/api-docs`
   - Alternative: `http://localhost:3000/docs`

3. **Explore the API**:
   - Browse endpoint categories
   - View request/response schemas
   - Test endpoints interactively

## Authentication Workflow

### Step 1: Register a New User

**Endpoint**: `POST /api/users/register`

**Example Request**:

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "terms": true
}
```

**Example Response**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "meta": {
    "user": {
      "id": "user_12345",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "status": "active"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "15m"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Step 2: Authenticate in Swagger

1. **Copy the access token** from the registration response
2. **Click "Authorize" button** in Swagger UI (lock icon at top right)
3. **Enter token** in format: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. **Click "Authorize"** to save the token

### Step 3: Test Protected Endpoints

Now you can test any protected endpoint that requires authentication.

## Common Use Cases

### User Profile Management

#### Get Current User Profile

**Endpoint**: `GET /api/users/profile`

- **Authentication**: Required
- **Rate Limit**: 100/15min
- **Description**: Retrieves complete user profile information

#### Update User Profile

**Endpoint**: `PUT /api/users/profile`

**Example Request**:

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "bio": "Software developer with expertise in Node.js and React"
}
```

#### Change Password

**Endpoint**: `PUT /api/users/change-password`

**Example Request**:

```json
{
  "currentPassword": "SecurePass123!",
  "password": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

### Public User Search

**Endpoint**: `GET /api/users/search`

**Example Parameters**:

- `search`: "john" (required)
- `page`: 1 (optional)
- `limit`: 10 (optional)
- `status`: "active" (optional)
- `role`: "user" (optional)

### Admin Operations

#### Get All Users (Admin Only)

**Endpoint**: `GET /api/users`

**Example Parameters**:

- `page`: 1
- `limit`: 10
- `status`: "active"
- `sortBy`: "createdAt"
- `sortOrder`: "desc"

#### Ban User (Admin Only)

**Endpoint**: `POST /api/users/{id}/ban`

**Example Request**:

```json
{
  "reason": "Violation of community guidelines - inappropriate behavior",
  "duration": 30
}
```

#### Bulk Delete Users (Admin Only)

**Endpoint**: `POST /api/users/bulk-delete`

**Example Request**:

```json
{
  "userIds": ["user_123", "user_456", "user_789"]
}
```

## Error Handling Examples

### Validation Errors (400)

**Example Response**:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Unauthorized Access (401)

**Example Response**:

```json
{
  "success": false,
  "message": "Invalid or missing authentication token",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Rate Limiting (429)

**Example Response**:

```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Testing Tips

### 1. Environment Variables

For testing, use environment variables:

```bash
NODE_ENV=development
JWT_SECRET=your-test-secret
JWT_REFRESH_SECRET=your-test-refresh-secret
```

### 2. Rate Limiting

During testing, you may hit rate limits. Wait for the time window to reset or restart the server to reset limits.

### 3. Authentication Flow

1. Register or login to get tokens
2. Use access token for protected endpoints
3. Refresh token when access token expires

### 4. Admin Testing

To test admin endpoints:

1. Register a user account
2. Manually update the user role to "admin" in your database
3. Login again to get admin-level tokens
4. Test admin endpoints

### 5. Bulk Operations

For bulk operations, test with small datasets first to understand the response format.

## Advanced Features

### Custom Headers

Some endpoints support custom headers:

- `Content-Type`: application/json
- `Authorization`: Bearer <token>
- `X-Forwarded-For`: Client IP (for rate limiting)

### Pagination

Most list endpoints support pagination:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- Response includes pagination metadata

### Filtering and Sorting

Search and list endpoints support:

- `search`: Text search
- `status`: Filter by status
- `role`: Filter by role
- `sortBy`: Sort field
- `sortOrder`: asc/desc

## Troubleshooting

### Common Issues

1. **Invalid Token**: Ensure token format is `Bearer <token>`
2. **Expired Token**: Get a new token by logging in again
3. **Missing Permissions**: Check user role for admin endpoints
4. **Rate Limited**: Wait for time window to reset
5. **Validation Errors**: Check required fields and formats

### Getting Help

- Check the Swagger UI for detailed schema information
- Review error messages for specific validation requirements
- Use the examples provided in the documentation
- Test with simple requests before complex operations

## Production Considerations

### Security

- Use HTTPS in production
- Implement proper CORS settings
- Set secure JWT secrets
- Monitor rate limiting logs

### Performance

- Implement caching for frequent requests
- Use database indexing for search operations
- Monitor API response times
- Set appropriate rate limits

### Monitoring

- Log all API requests
- Monitor error rates
- Track authentication failures
- Set up alerts for unusual activity
