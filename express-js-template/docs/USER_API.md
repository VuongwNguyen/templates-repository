# User API Documentation

## Overview

This document describes the complete RESTful API for user management in the Express.js template. The API follows REST principles and includes proper authentication, validation, rate limiting, and error handling.

## Base URL

```
http://localhost:3000/api/users
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All responses follow this format:

```json
{
  "statusResponse": true/false,
  "message": "Response message",
  "statusCode": 200,
  "meta": {
    // Response data
  }
}
```

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Sensitive operations: 3 requests per hour
- Email operations: 10 requests per hour
- File uploads: 20 requests per hour

---

## Public Endpoints

### Register User

```http
POST /api/users/register
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "phone": "+1234567890",
  "terms": true
}
```

**Response:**

```json
{
  "statusResponse": true,
  "message": "User registered successfully",
  "statusCode": 201,
  "meta": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
      // ... user data without password
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### Login User

```http
POST /api/users/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```

### Search Users (Public)

```http
GET /api/users/search?search=john&page=1&limit=10
```

**Query Parameters:**

- `search` (required): Search term
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `role`: Filter by role (user, admin, moderator)
- `status`: Filter by status (active, inactive, banned)

---

## Protected User Endpoints

### Get Current User Profile

```http
GET /api/users/profile
```

**Headers:** `Authorization: Bearer <token>`

### Update Current User Profile

```http
PUT /api/users/profile
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "bio": "Software developer"
}
```

### Change Password

```http
PUT /api/users/change-password
```

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "password": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

### Update Preferences

```http
PUT /api/users/preferences
```

**Request Body:**

```json
{
  "emailNotifications": true,
  "pushNotifications": false,
  "language": "en",
  "theme": "dark"
}
```

### Verify Email

```http
PUT /api/users/verify-email
```

### Delete Account

```http
DELETE /api/users/account
```

**Request Body:**

```json
{
  "password": "CurrentPass123!",
  "confirmation": "DELETE"
}
```

### Upload Avatar

```http
POST /api/users/upload/avatar
```

**Content-Type:** `multipart/form-data`

- `avatar`: Image file (max 5MB, jpg/png/gif)
- `description`: Optional description

---

## Admin Endpoints

### Get All Users

```http
GET /api/users?page=1&limit=10&search=john&role=user&status=active
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search in name/email
- `role`: Filter by role
- `status`: Filter by status
- `sortBy`: Sort field (firstName, lastName, email, createdAt, etc.)
- `sortOrder`: asc or desc

### Get User Statistics

```http
GET /api/users/stats
```

**Response:**

```json
{
  "statusResponse": true,
  "message": "User statistics retrieved successfully",
  "statusCode": 200,
  "meta": {
    "stats": {
      "total": 1000,
      "active": 850,
      "banned": 50,
      "admins": 5,
      "regular": 995
    }
  }
}
```

### Get User by ID

```http
GET /api/users/:id
```

### Update User by ID

```http
PUT /api/users/:id
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "newemail@example.com",
  "role": "moderator",
  "status": "active"
}
```

### Delete User by ID

```http
DELETE /api/users/:id
```

### Ban User

```http
POST /api/users/:id/ban
```

**Request Body:**

```json
{
  "reason": "Violation of terms of service",
  "duration": 30
}
```

### Unban User

```http
POST /api/users/:id/unban
```

---

## Bulk Operations (Admin)

### Bulk Delete Users

```http
POST /api/users/bulk-delete
```

**Request Body:**

```json
{
  "userIds": [1, 2, 3, 4, 5]
}
```

### Bulk Update Status

```http
PUT /api/users/bulk-update-status
```

**Request Body:**

```json
{
  "userIds": [1, 2, 3],
  "status": "inactive"
}
```

---

## Error Responses

### Validation Error (400)

```json
{
  "statusResponse": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

### Unauthorized (401)

```json
{
  "statusResponse": false,
  "message": "Invalid email or password",
  "statusCode": 401
}
```

### Forbidden (403)

```json
{
  "statusResponse": false,
  "message": "Account is inactive or banned",
  "statusCode": 403
}
```

### Not Found (404)

```json
{
  "statusResponse": false,
  "message": "User not found",
  "statusCode": 404
}
```

### Conflict (409)

```json
{
  "statusResponse": false,
  "message": "Email already registered",
  "statusCode": 409
}
```

### Rate Limit (429)

```json
{
  "statusResponse": false,
  "message": "Too many requests, please try again later",
  "statusCode": 429
}
```

---

## Usage Examples

### Using cURL

**Register:**

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "phone": "+1234567890",
    "terms": true
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Get Profile:**

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript (Fetch)

```javascript
// Register user
const registerUser = async (userData) => {
  const response = await fetch("/api/users/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// Get user profile
const getProfile = async (token) => {
  const response = await fetch("/api/users/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
```

---

## Security Features

1. **JWT Authentication** - Secure token-based authentication
2. **Password Hashing** - BCrypt with salt rounds
3. **Rate Limiting** - Prevents brute force attacks
4. **Input Validation** - Comprehensive validation rules
5. **Data Sanitization** - XSS and injection protection
6. **Role-based Access** - Admin/user permission levels
7. **Soft Delete** - Users are marked as deleted, not permanently removed

---

## Notes

- All timestamps are in ISO 8601 format
- Password requirements: minimum 8 characters, must contain uppercase, lowercase, number, and special character
- Email verification is supported but email sending logic needs to be implemented
- File upload requires multer middleware configuration
- Database operations are currently using mock data - replace with actual database integration
