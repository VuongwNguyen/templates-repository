# Express.js Template

A comprehensive and production-ready Express.js backend template with authentication, security, validation, testing, and more.

## Features

### Core Features

- **Express.js Server** with optimized configuration
- **JWT Authentication** with access and refresh tokens
- **Socket.io Integration** for real-time communication
- **Winston Logging** with file and console outputs
- **File Upload** with Multer middleware
- **Email Service** with Nodemailer integration
- **CORS Configuration** for cross-origin requests
- **Environment Configuration** with dotenv

### Security Features

- **Input Validation & Sanitization** with express-validator
- **Rate Limiting** for different endpoint types
- **XSS Protection** with xss library
- **NoSQL Injection Protection** with express-mongo-sanitize
- **Parameter Pollution Protection** with hpp
- **Security Headers** with Helmet
- **Password Hashing** with bcrypt

### Testing Framework

- **Jest Testing Framework** with comprehensive test suites
- **Unit Tests** for business logic validation
- **Integration Tests** for API endpoint testing
- **End-to-End Tests** for complete workflow validation
- **Test Utilities** and helpers for efficient testing
- **Coverage Reports** with configurable thresholds
- **CI/CD Integration** with GitHub Actions

### API Features

- **RESTful User Management** with full CRUD operations
- **Role-based Access Control** (User, Moderator, Admin)
- **Profile Management** with validation
- **Password Management** with secure updates
- **User Search & Discovery** with pagination
- **Bulk Operations** for admin users
- **Comprehensive Error Handling** with structured responses

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd express-js-template
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`

5. Start the development server:

```bash
npm run dev
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:e2e         # End-to-end tests only

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## API Documentation

### Swagger/OpenAPI Documentation

The API includes comprehensive Swagger/OpenAPI 3.0 documentation with interactive testing capabilities.

#### Accessing API Documentation

```bash
# Start the development server
npm run dev

# Access Swagger UI at:
http://localhost:3000/api-docs

# Alternative URL:
http://localhost:3000/docs
```

#### Features

- **Interactive API Testing**: Test endpoints directly from the browser
- **Comprehensive Schemas**: Detailed request/response models
- **Authentication Support**: Built-in JWT token testing
- **Examples & Use Cases**: Real-world request/response examples
- **Error Documentation**: Complete error handling scenarios
- **Rate Limiting Info**: Documentation of API limits and quotas

#### API Endpoint Categories

1. **Authentication** (`/api/users/register`, `/api/users/login`)

   - User registration and login
   - JWT token generation
   - Account verification

2. **User Management** (`/api/users/profile/*`)

   - Profile CRUD operations
   - Password management
   - Account deletion

3. **Public Endpoints** (`/api/users/search`)

   - Public user search
   - No authentication required

4. **Admin Operations** (`/api/users/*` - Admin only)
   - User management
   - Bulk operations
   - System statistics
   - Ban/unban functionality

#### Authentication in Swagger

1. Click **"Authorize"** button in Swagger UI
2. Enter your JWT token: `Bearer <your-token>`
3. Test protected endpoints with authentication

#### Custom Swagger Configuration

```javascript
// docs/swagger.config.js
const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "Express.js Template API",
    version: "1.0.0",
    description: "Comprehensive backend API documentation",
  },
  servers: [
    { url: "http://localhost:3000", description: "Development" },
    { url: "https://api.example.com", description: "Production" },
  ],
};
```

### Test Structure

```
tests/
├── setup.js              # Global test configuration
├── utils/
│   ├── testUtils.js      # Testing utilities and helpers
│   └── databaseHelper.js # Database test operations
├── unit/                 # Unit tests
│   └── userService.test.js
├── integration/          # Integration tests
│   └── userAPI.test.js
└── e2e/                  # End-to-end tests
    └── userWorkflows.test.js
```

### Test Features

- **Comprehensive Coverage**: Unit, integration, and E2E tests
- **Test Utilities**: Helper functions for authentication, data creation, and assertions
- **Database Helpers**: Test data management and cleanup
- **Performance Testing**: Concurrent operations and load testing
- **Security Testing**: XSS, injection, and unauthorized access protection
- **Error Scenario Testing**: Validation errors, rate limiting, and edge cases

### Coverage Thresholds

- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint              | Description       | Access | Rate Limit |
| ------ | --------------------- | ----------------- | ------ | ---------- |
| POST   | `/api/users/register` | User registration | Public | 5/15min    |
| POST   | `/api/users/login`    | User login        | Public | 5/15min    |

### User Management Endpoints

| Method | Endpoint                     | Description      | Access        | Rate Limit |
| ------ | ---------------------------- | ---------------- | ------------- | ---------- |
| GET    | `/api/users/profile`         | Get user profile | Authenticated | 100/15min  |
| PUT    | `/api/users/profile`         | Update profile   | Authenticated | 100/15min  |
| PUT    | `/api/users/change-password` | Change password  | Authenticated | 3/15min    |
| DELETE | `/api/users/account`         | Delete account   | Authenticated | 3/15min    |

### Public Endpoints

| Method | Endpoint            | Description       | Access | Rate Limit |
| ------ | ------------------- | ----------------- | ------ | ---------- |
| GET    | `/api/users/search` | Search users      | Public | 100/15min  |
| GET    | `/health`           | Health check      | Public | None       |
| GET    | `/api-docs`         | API Documentation | Public | None       |

### Admin Endpoints

| Method | Endpoint                 | Description       | Access | Rate Limit |
| ------ | ------------------------ | ----------------- | ------ | ---------- |
| GET    | `/api/users`             | Get all users     | Admin  | 100/15min  |
| GET    | `/api/users/stats`       | User statistics   | Admin  | 100/15min  |
| GET    | `/api/users/:id`         | Get user by ID    | Admin  | 100/15min  |
| PUT    | `/api/users/:id`         | Update user       | Admin  | 100/15min  |
| DELETE | `/api/users/:id`         | Delete user       | Admin  | 3/15min    |
| POST   | `/api/users/:id/ban`     | Ban user          | Admin  | 3/15min    |
| POST   | `/api/users/:id/unban`   | Unban user        | Admin  | 3/15min    |
| POST   | `/api/users/bulk-delete` | Bulk delete users | Admin  | 3/15min    |

### Response Format

All API responses follow a consistent format:
| POST | `/api/users/register` | User registration | Public |
| POST | `/api/users/login` | User login | Public |

### User Management Endpoints

| Method | Endpoint                     | Description      | Access        |
| ------ | ---------------------------- | ---------------- | ------------- |
| GET    | `/api/users/profile`         | Get user profile | Authenticated |
| PUT    | `/api/users/profile`         | Update profile   | Authenticated |
| PUT    | `/api/users/change-password` | Change password  | Authenticated |
| DELETE | `/api/users/account`         | Delete account   | Authenticated |

### Public Endpoints

| Method | Endpoint            | Description  | Access |
| ------ | ------------------- | ------------ | ------ |
| GET    | `/api/users/search` | Search users | Public |

### Admin Endpoints

| Method | Endpoint                 | Description       | Access |
| ------ | ------------------------ | ----------------- | ------ |
| GET    | `/api/users`             | Get all users     | Admin  |
| GET    | `/api/users/:id`         | Get user by ID    | Admin  |
| PUT    | `/api/users/:id`         | Update user       | Admin  |
| DELETE | `/api/users/:id`         | Delete user       | Admin  |
| POST   | `/api/users/:id/ban`     | Ban user          | Admin  |
| POST   | `/api/users/:id/unban`   | Unban user        | Admin  |
| POST   | `/api/users/bulk-delete` | Bulk delete users | Admin  |

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "meta": {
    "user": {},
    "tokens": {},
    "pagination": {}
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Docker Support

### Development with Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run tests in Docker
docker-compose -f docker-compose.test.yml up --build
```

### Production Deployment

```bash
# Build production image
docker build -t express-template .

# Run production container
docker run -p 3000:3000 --env-file .env express-template
```

## CI/CD Pipeline

The template includes a comprehensive GitHub Actions workflow:

- **Multi-Node Testing**: Tests across Node.js 16, 18, and 20
- **Security Scanning**: NPM audit and Snyk security checks
- **Code Coverage**: Automated coverage reporting
- **Deployment**: Automated staging and production deployments

## Project Structure

```
├── app.js                 # Main application file
├── socket.js             # Socket.io configuration
├── package.json          # Dependencies and scripts
├── jest.config.js        # Jest testing configuration
├── docker-compose.yml    # Docker development setup
├── .github/workflows/    # CI/CD configuration
├── bin/
│   └── www              # Server startup script
├── conf/
│   └── mailer.js        # Email configuration
├── controllers/         # Request handlers
├── middlewares/         # Custom middleware
├── models/             # Data models
├── routes/             # API routes
├── services/           # Business logic
├── validations/        # Input validation schemas
├── util/               # Utility functions
├── tests/              # Test suites
└── logs/               # Application logs
```

## Environment Variables

Required environment variables:

```bash
NODE_ENV=development
PORT=3000
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## Security Features

### Input Validation

- Email format validation
- Password strength requirements
- Phone number format validation
- File upload restrictions
- Request payload size limits

### Rate Limiting

- **Authentication endpoints**: 5 requests per 15 minutes
- **General endpoints**: 100 requests per 15 minutes
- **Sensitive operations**: 3 requests per 15 minutes

### Data Sanitization

- XSS attack prevention
- NoSQL injection protection
- Parameter pollution prevention
- HTML tag stripping
- Special character escaping

## Development Tools

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run all tests
npm run test:unit  # Run unit tests
npm run test:integration  # Run integration tests
npm run test:e2e   # Run end-to-end tests
npm run test:coverage     # Run tests with coverage
npm run test:watch        # Run tests in watch mode
```

### Logging

The application uses Winston for structured logging:

- **Console logging**: Development environment
- **File logging**: Production environment
- **Error tracking**: Separate error log file
- **Request logging**: HTTP request tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## Testing Guidelines

### Writing Tests

1. **Unit Tests**: Test individual functions and modules in isolation
2. **Integration Tests**: Test API endpoints with middleware integration
3. **E2E Tests**: Test complete user workflows and business processes

### Test Best Practices

- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Test both success and error scenarios
- Mock external dependencies
- Maintain test isolation
- Use test utilities for common operations

### Mock Data

The testing framework provides utilities for generating realistic test data:

```javascript
const TestUtils = require("./tests/utils/testUtils");

// Generate test user data
const userData = TestUtils.createUserData();

// Generate authentication tokens
const token = TestUtils.generateToken({ user_id: "test-id" });

// Create API request helpers
const response = await TestUtils.apiRequest(
  app,
  "POST",
  "/api/users/register",
  userData
);
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
