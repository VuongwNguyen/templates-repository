/**
 * Swagger Configuration
 * 
 * This file contains the main Swagger/OpenAPI configuration for the API documentation.
 * It defines the API information, servers, security schemes, and reusable components.
 */

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Express.js Template API',
            version: '1.0.0',
            description: `
        A comprehensive and production-ready Express.js backend API with authentication, 
        user management, security features, and more.
        
        ## Features
        - JWT Authentication with access and refresh tokens
        - Role-based access control (User, Moderator, Admin)
        - Input validation and sanitization
        - Rate limiting and security protection
        - File upload capabilities
        - Real-time communication with Socket.io
        - Comprehensive error handling
        
        ## Authentication
        Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
        \`Authorization: Bearer <your-token>\`
        
        ## Rate Limiting
        - Authentication endpoints: 5 requests per 15 minutes
        - General endpoints: 100 requests per 15 minutes
        - Sensitive operations: 3 requests per 15 minutes
      `,
            contact: {
                name: 'VuongwNguyen(Yinnz)',
                email: 'nguyenvuongw134@gmail.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'https://staging.example.com',
                description: 'Staging server'
            },
            {
                url: 'https://api.example.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT access token for authenticated requests'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Unique user identifier',
                            example: 'user_12345'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'user@example.com'
                        },
                        firstName: {
                            type: 'string',
                            description: 'User first name',
                            example: 'John'
                        },
                        lastName: {
                            type: 'string',
                            description: 'User last name',
                            example: 'Doe'
                        },
                        phone: {
                            type: 'string',
                            description: 'User phone number',
                            example: '+1234567890'
                        },
                        bio: {
                            type: 'string',
                            description: 'User biography',
                            example: 'Software developer passionate about technology'
                        },
                        avatar: {
                            type: 'string',
                            description: 'User avatar URL',
                            example: 'https://example.com/avatars/user123.jpg'
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'moderator', 'admin'],
                            description: 'User role',
                            example: 'user'
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'inactive', 'banned', 'pending'],
                            description: 'User account status',
                            example: 'active'
                        },
                        isEmailVerified: {
                            type: 'boolean',
                            description: 'Email verification status',
                            example: true
                        },
                        lastLoginAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last login timestamp',
                            example: '2024-01-15T10:30:00.000Z'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Account creation timestamp',
                            example: '2024-01-01T00:00:00.000Z'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp',
                            example: '2024-01-15T10:30:00.000Z'
                        }
                    }
                },
                UserRegistration: {
                    type: 'object',
                    required: ['email', 'password', 'firstName', 'lastName', 'terms'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'user@example.com'
                        },
                        password: {
                            type: 'string',
                            minLength: 8,
                            description: 'User password (min 8 characters, must include uppercase, lowercase, number, and special character)',
                            example: 'SecurePass123!'
                        },
                        firstName: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 50,
                            description: 'User first name',
                            example: 'John'
                        },
                        lastName: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 50,
                            description: 'User last name',
                            example: 'Doe'
                        },
                        phone: {
                            type: 'string',
                            pattern: '^\\+?[1-9]\\d{1,14}$',
                            description: 'User phone number (optional)',
                            example: '+1234567890'
                        },
                        terms: {
                            type: 'boolean',
                            description: 'Acceptance of terms and conditions',
                            example: true
                        }
                    }
                },
                UserLogin: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'user@example.com'
                        },
                        password: {
                            type: 'string',
                            description: 'User password',
                            example: 'SecurePass123!'
                        }
                    }
                },
                UserProfileUpdate: {
                    type: 'object',
                    properties: {
                        firstName: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 50,
                            description: 'User first name',
                            example: 'John'
                        },
                        lastName: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 50,
                            description: 'User last name',
                            example: 'Doe'
                        },
                        phone: {
                            type: 'string',
                            pattern: '^\\+?[1-9]\\d{1,14}$',
                            description: 'User phone number',
                            example: '+1234567890'
                        },
                        bio: {
                            type: 'string',
                            maxLength: 500,
                            description: 'User biography',
                            example: 'Software developer passionate about technology'
                        }
                    }
                },
                PasswordChange: {
                    type: 'object',
                    required: ['currentPassword', 'password', 'confirmPassword'],
                    properties: {
                        currentPassword: {
                            type: 'string',
                            description: 'Current user password',
                            example: 'OldPassword123!'
                        },
                        password: {
                            type: 'string',
                            minLength: 8,
                            description: 'New password',
                            example: 'NewSecurePass123!'
                        },
                        confirmPassword: {
                            type: 'string',
                            description: 'Confirm new password',
                            example: 'NewSecurePass123!'
                        }
                    }
                },
                AccountDeletion: {
                    type: 'object',
                    required: ['password', 'confirmation'],
                    properties: {
                        password: {
                            type: 'string',
                            description: 'Current user password',
                            example: 'SecurePass123!'
                        },
                        confirmation: {
                            type: 'string',
                            enum: ['DELETE'],
                            description: 'Confirmation text (must be "DELETE")',
                            example: 'DELETE'
                        }
                    }
                },
                UserBan: {
                    type: 'object',
                    required: ['reason'],
                    properties: {
                        reason: {
                            type: 'string',
                            minLength: 10,
                            maxLength: 500,
                            description: 'Reason for banning the user',
                            example: 'Violation of community guidelines - inappropriate behavior'
                        },
                        duration: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 365,
                            description: 'Ban duration in days (optional, permanent if not specified)',
                            example: 30
                        }
                    }
                },
                BulkDelete: {
                    type: 'object',
                    required: ['userIds'],
                    properties: {
                        userIds: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            minItems: 1,
                            maxItems: 100,
                            description: 'Array of user IDs to delete',
                            example: ['user_123', 'user_456', 'user_789']
                        }
                    }
                },
                Tokens: {
                    type: 'object',
                    properties: {
                        accessToken: {
                            type: 'string',
                            description: 'JWT access token',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        },
                        refreshToken: {
                            type: 'string',
                            description: 'JWT refresh token',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        },
                        expiresIn: {
                            type: 'string',
                            description: 'Access token expiration time',
                            example: '15m'
                        }
                    }
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        page: {
                            type: 'integer',
                            description: 'Current page number',
                            example: 1
                        },
                        limit: {
                            type: 'integer',
                            description: 'Items per page',
                            example: 10
                        },
                        total: {
                            type: 'integer',
                            description: 'Total number of items',
                            example: 150
                        },
                        totalPages: {
                            type: 'integer',
                            description: 'Total number of pages',
                            example: 15
                        },
                        hasNext: {
                            type: 'boolean',
                            description: 'Whether there is a next page',
                            example: true
                        },
                        hasPrev: {
                            type: 'boolean',
                            description: 'Whether there is a previous page',
                            example: false
                        }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Operation completed successfully'
                        },
                        meta: {
                            type: 'object',
                            description: 'Response metadata (varies by endpoint)'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00.000Z'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'An error occurred'
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: {
                                        type: 'string',
                                        example: 'email'
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Invalid email format'
                                    }
                                }
                            }
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00.000Z'
                        }
                    }
                },
                ValidationError: {
                    allOf: [
                        { $ref: '#/components/schemas/ErrorResponse' },
                        {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    example: 'Validation failed'
                                }
                            }
                        }
                    ]
                }
            },
            responses: {
                ValidationError: {
                    description: 'Validation error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ValidationError'
                            }
                        }
                    }
                },
                Unauthorized: {
                    description: 'Unauthorized - Invalid or missing authentication token',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/ErrorResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'Invalid or missing authentication token'
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                Forbidden: {
                    description: 'Forbidden - Insufficient permissions',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/ErrorResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'Insufficient permissions to access this resource'
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                NotFound: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/ErrorResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'Resource not found'
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                RateLimit: {
                    description: 'Rate limit exceeded',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/ErrorResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'Too many requests, please try again later'
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                InternalServerError: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/ErrorResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'An unexpected error occurred'
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            parameters: {
                PageQuery: {
                    name: 'page',
                    in: 'query',
                    description: 'Page number for pagination',
                    required: false,
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        default: 1
                    }
                },
                LimitQuery: {
                    name: 'limit',
                    in: 'query',
                    description: 'Number of items per page',
                    required: false,
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100,
                        default: 10
                    }
                },
                SearchQuery: {
                    name: 'search',
                    in: 'query',
                    description: 'Search term for filtering results',
                    required: true,
                    schema: {
                        type: 'string',
                        minLength: 1
                    }
                },
                UserIdPath: {
                    name: 'id',
                    in: 'path',
                    description: 'User ID',
                    required: true,
                    schema: {
                        type: 'string'
                    }
                },
                StatusQuery: {
                    name: 'status',
                    in: 'query',
                    description: 'Filter by user status',
                    required: false,
                    schema: {
                        type: 'string',
                        enum: ['active', 'inactive', 'banned', 'pending']
                    }
                },
                RoleQuery: {
                    name: 'role',
                    in: 'query',
                    description: 'Filter by user role',
                    required: false,
                    schema: {
                        type: 'string',
                        enum: ['user', 'moderator', 'admin']
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and authorization endpoints'
            },
            {
                name: 'User Management',
                description: 'User profile and account management endpoints'
            },
            {
                name: 'Admin',
                description: 'Administrative endpoints for user management'
            },
            {
                name: 'Public',
                description: 'Public endpoints that do not require authentication'
            }
        ]
    },
    apis: [
        './routes/*.js',
        './controllers/*.js',
        './models/*.js',
        './docs/*.js'
    ]
};

const specs = swaggerJSDoc(options);

module.exports = {
    specs,
    swaggerUi,
    options: {
        explorer: true,
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
            tryItOutEnabled: true
        },
        customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 15px; border-radius: 5px; }
    `
    }
};