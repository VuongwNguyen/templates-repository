/**
 * User Routes
 * 
 * Complete RESTful API routes for user management
 * Includes authentication, validation, rate limiting, and proper middleware chain
 */

const express = require('express');
const router = express.Router();

// Import controllers
const UserController = require('../controllers/user.controller');

// Import validation
const UserValidation = require('../validations/user.validation');

// Import middlewares
const { protected, adminVerify } = require('../middlewares/protected');
const RateLimitMiddleware = require('../middlewares/rateLimit.middleware');
const SanitizationMiddleware = require('../middlewares/sanitization.middleware');

// ==================== PUBLIC ROUTES ====================

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user account
 *     description: |
 *       Creates a new user account with email and password authentication.
 *       Returns user information and JWT tokens upon successful registration.
 *       
 *       **Rate Limiting**: 5 requests per 15 minutes
 *       
 *       **Validation Rules**:
 *       - Email must be valid and unique
 *       - Password must be at least 8 characters with uppercase, lowercase, number, and special character
 *       - First and last name must be 2-50 characters
 *       - Terms of service must be accepted
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *           examples:
 *             validUser:
 *               summary: Valid user registration
 *               value:
 *                 email: "john.doe@example.com"
 *                 password: "SecurePass123!"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 phone: "+1234567890"
 *                 terms: true
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         tokens:
 *                           $ref: '#/components/schemas/Tokens'
 *             examples:
 *               success:
 *                 summary: Successful registration
 *                 value:
 *                   success: true
 *                   message: "User registered successfully"
 *                   meta:
 *                     user:
 *                       id: "user_12345"
 *                       email: "john.doe@example.com"
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                       phone: "+1234567890"
 *                       role: "user"
 *                       status: "active"
 *                       isEmailVerified: false
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                     tokens:
 *                       accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       expiresIn: "15m"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               duplicateEmail:
 *                 summary: Email already exists
 *                 value:
 *                   success: false
 *                   message: "Email already registered"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register',
    RateLimitMiddleware.auth(),
    UserValidation.register,
    UserController.register
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login authentication
 *     description: |
 *       Authenticates user with email and password credentials.
 *       Returns user information and JWT tokens upon successful authentication.
 *       
 *       **Rate Limiting**: 5 requests per 15 minutes
 *       
 *       **Security Features**:
 *       - Passwords are hashed using bcrypt
 *       - Returns JWT access and refresh tokens
 *       - Tracks last login timestamp
 *       - Blocked users cannot login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *           examples:
 *             validLogin:
 *               summary: Valid login credentials
 *               value:
 *                 email: "john.doe@example.com"
 *                 password: "SecurePass123!"
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         tokens:
 *                           $ref: '#/components/schemas/Tokens'
 *             examples:
 *               success:
 *                 summary: Successful login
 *                 value:
 *                   success: true
 *                   message: "Login successful"
 *                   meta:
 *                     user:
 *                       id: "user_12345"
 *                       email: "john.doe@example.com"
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                       role: "user"
 *                       status: "active"
 *                       lastLoginAt: "2024-01-15T10:30:00.000Z"
 *                     tokens:
 *                       accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       expiresIn: "15m"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidCredentials:
 *                 summary: Wrong email or password
 *                 value:
 *                   success: false
 *                   message: "Invalid email or password"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       403:
 *         description: Account banned or inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               bannedAccount:
 *                 summary: Account is banned
 *                 value:
 *                   success: false
 *                   message: "Account is banned. Please contact support."
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 * @route   POST /api/users/login
 * @desc    User login
 * @access  Public
 */
router.post('/login',
    RateLimitMiddleware.auth(),
    UserValidation.login,
    UserController.login
);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     tags: [Public]
 *     summary: Search users with public information
 *     description: |
 *       Search for users using various criteria. Returns limited public information only.
 *       Supports pagination and filtering by status and role.
 *       
 *       **Rate Limiting**: 100 requests per 15 minutes
 *       
 *       **Returned Information**: Only public profile data (name, avatar, basic info)
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/StatusQuery'
 *       - $ref: '#/components/parameters/RoleQuery'
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               avatar:
 *                                 type: string
 *                               role:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *             examples:
 *               success:
 *                 summary: Successful search
 *                 value:
 *                   success: true
 *                   message: "Search completed successfully"
 *                   meta:
 *                     users:
 *                       - id: "user_123"
 *                         firstName: "John"
 *                         lastName: "Doe"
 *                         avatar: "https://example.com/avatars/john.jpg"
 *                         role: "user"
 *                         status: "active"
 *                       - id: "user_456"
 *                         firstName: "Jane"
 *                         lastName: "Smith"
 *                         avatar: null
 *                         role: "user"
 *                         status: "active"
 *                     pagination:
 *                       page: 1
 *                       limit: 10
 *                       total: 25
 *                       totalPages: 3
 *                       hasNext: true
 *                       hasPrev: false
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 * @route   GET /api/users/search
 * @desc    Search users (public search with limited info)
 * @access  Public
 */
router.get('/search',
    RateLimitMiddleware.general(),
    UserValidation.searchUsers,
    UserController.searchUsers
);

// ==================== PROTECTED USER ROUTES ====================

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [User Management]
 *     summary: Get current user profile
 *     description: |
 *       Retrieves the complete profile information for the authenticated user.
 *       Includes all user data except sensitive information like password.
 *       
 *       **Authentication Required**: Bearer token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             examples:
 *               success:
 *                 summary: Profile retrieved successfully
 *                 value:
 *                   success: true
 *                   message: "Profile retrieved successfully"
 *                   meta:
 *                     user:
 *                       id: "user_12345"
 *                       email: "john.doe@example.com"
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                       phone: "+1234567890"
 *                       bio: "Software developer passionate about technology"
 *                       avatar: "https://example.com/avatars/john.jpg"
 *                       role: "user"
 *                       status: "active"
 *                       isEmailVerified: true
 *                       lastLoginAt: "2024-01-15T10:30:00.000Z"
 *                       createdAt: "2024-01-01T00:00:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   put:
 *     tags: [User Management]
 *     summary: Update user profile
 *     description: |
 *       Updates the current user's profile information.
 *       All fields are optional. Only provided fields will be updated.
 *       
 *       **Authentication Required**: Bearer token
 *       
 *       **Rate Limiting**: 100 requests per 15 minutes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileUpdate'
 *           examples:
 *             partialUpdate:
 *               summary: Partial profile update
 *               value:
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 phone: "+1234567890"
 *                 bio: "Updated bio description"
 *             fullUpdate:
 *               summary: Complete profile update
 *               value:
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 phone: "+1234567890"
 *                 bio: "Software developer with 5+ years experience in Node.js and React"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             examples:
 *               success:
 *                 summary: Profile updated successfully
 *                 value:
 *                   success: true
 *                   message: "Profile updated successfully"
 *                   meta:
 *                     user:
 *                       id: "user_12345"
 *                       email: "john.doe@example.com"
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                       phone: "+1234567890"
 *                       bio: "Updated bio description"
 *                       role: "user"
 *                       status: "active"
 *                       updatedAt: "2024-01-15T10:35:00.000Z"
 *                   timestamp: "2024-01-15T10:35:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile',
    RateLimitMiddleware.general(),
    protected,
    UserController.getProfile
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile',
    RateLimitMiddleware.general(),
    protected,
    UserValidation.updateProfile,
    UserController.updateProfile
);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     tags: [User Management]
 *     summary: Change user password
 *     description: |
 *       Updates the current user's password with proper validation.
 *       Requires current password for verification before setting new password.
 *       
 *       **Authentication Required**: Bearer token
 *       **Rate Limiting**: 3 requests per 15 minutes (sensitive operation)
 *       
 *       **Security Features**:
 *       - Current password verification required
 *       - New password strength validation
 *       - Password confirmation matching
 *       - Automatic password hashing
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordChange'
 *           examples:
 *             validPasswordChange:
 *               summary: Valid password change
 *               value:
 *                 currentPassword: "OldPassword123!"
 *                 password: "NewSecurePass123!"
 *                 confirmPassword: "NewSecurePass123!"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: "Password updated successfully"
 *             examples:
 *               success:
 *                 summary: Password changed successfully
 *                 value:
 *                   success: true
 *                   message: "Password updated successfully"
 *                   meta:
 *                     message: "Password updated successfully"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Validation error or incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               incorrectPassword:
 *                 summary: Current password is incorrect
 *                 value:
 *                   success: false
 *                   message: "Current password is incorrect"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *               validationError:
 *                 summary: Password validation failed
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "password"
 *                       message: "Password must be at least 8 characters long"
 *                     - field: "confirmPassword"
 *                       message: "Passwords do not match"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password',
    RateLimitMiddleware.sensitive(),
    protected,
    UserValidation.changePassword,
    UserController.changePassword
);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences',
    RateLimitMiddleware.general(),
    protected,
    UserValidation.updatePreferences,
    UserController.updatePreferences
);

/**
 * @route   PUT /api/users/verify-email
 * @desc    Verify user email
 * @access  Private
 */
router.put('/verify-email',
    RateLimitMiddleware.email(),
    protected,
    UserController.verifyEmail
);

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     tags: [User Management]
 *     summary: Delete current user account
 *     description: |
 *       Permanently deletes the current user's account and all associated data.
 *       This action is irreversible and requires password confirmation.
 *       
 *       **Authentication Required**: Bearer token
 *       **Rate Limiting**: 3 requests per 15 minutes (sensitive operation)
 *       
 *       **Security Features**:
 *       - Password verification required
 *       - Explicit confirmation required ("DELETE")
 *       - Soft delete option available
 *       - Data cleanup included
 *       
 *       **Warning**: This action cannot be undone. All user data will be permanently removed.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccountDeletion'
 *           examples:
 *             validDeletion:
 *               summary: Valid account deletion request
 *               value:
 *                 password: "SecurePass123!"
 *                 confirmation: "DELETE"
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: "Account deleted successfully"
 *             examples:
 *               success:
 *                 summary: Account deleted successfully
 *                 value:
 *                   success: true
 *                   message: "Account deleted successfully"
 *                   meta:
 *                     message: "Account deleted successfully"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Validation error or incorrect password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               incorrectPassword:
 *                 summary: Incorrect password
 *                 value:
 *                   success: false
 *                   message: "Incorrect password"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *               invalidConfirmation:
 *                 summary: Invalid confirmation text
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "confirmation"
 *                       message: "Must type 'DELETE' to confirm account deletion"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 * @route   DELETE /api/users/account
 * @desc    Delete current user account
 * @access  Private
 */
router.delete('/account',
    RateLimitMiddleware.sensitive(),
    protected,
    UserValidation.deleteAccount,
    UserController.deleteAccount
);

// ==================== ADMIN ROUTES ====================

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users with pagination and filters
 *     description: |
 *       Retrieves a paginated list of all users with optional filtering capabilities.
 *       Only accessible by administrators.
 *       
 *       **Authentication Required**: Bearer token with admin role
 *       **Rate Limiting**: 100 requests per 15 minutes
 *       
 *       **Filter Options**:
 *       - Status: active, inactive, banned, pending
 *       - Role: user, moderator, admin
 *       - Search: email, name, or other user attributes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/StatusQuery'
 *       - $ref: '#/components/parameters/RoleQuery'
 *       - name: search
 *         in: query
 *         description: Search term for user email, name, or ID
 *         required: false
 *         schema:
 *           type: string
 *       - name: sortBy
 *         in: query
 *         description: Field to sort by
 *         required: false
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, email, firstName, lastName, lastLoginAt]
 *           default: createdAt
 *       - name: sortOrder
 *         in: query
 *         description: Sort order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *                         filters:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                             role:
 *                               type: string
 *                             search:
 *                               type: string
 *             examples:
 *               success:
 *                 summary: Users list retrieved successfully
 *                 value:
 *                   success: true
 *                   message: "Users retrieved successfully"
 *                   meta:
 *                     users:
 *                       - id: "user_123"
 *                         email: "john.doe@example.com"
 *                         firstName: "John"
 *                         lastName: "Doe"
 *                         role: "user"
 *                         status: "active"
 *                         lastLoginAt: "2024-01-15T10:30:00.000Z"
 *                         createdAt: "2024-01-01T00:00:00.000Z"
 *                       - id: "user_456"
 *                         email: "jane.smith@example.com"
 *                         firstName: "Jane"
 *                         lastName: "Smith"
 *                         role: "moderator"
 *                         status: "active"
 *                         lastLoginAt: "2024-01-14T15:20:00.000Z"
 *                         createdAt: "2024-01-02T00:00:00.000Z"
 *                     pagination:
 *                       page: 1
 *                       limit: 10
 *                       total: 156
 *                       totalPages: 16
 *                       hasNext: true
 *                       hasPrev: false
 *                     filters:
 *                       status: "active"
 *                       role: null
 *                       search: null
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 * @route   GET /api/users
 * @desc    Get all users with pagination and filters
 * @access  Admin
 */
router.get('/',
    RateLimitMiddleware.general(),
    protected,
    adminVerify,
    UserValidation.getAllUsers,
    UserController.getAllUsers
);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Admin
 */
router.get('/stats',
    RateLimitMiddleware.general(),
    protected,
    adminVerify,
    UserController.getUserStats
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Admin
 */
router.get('/:id',
    RateLimitMiddleware.general(),
    protected,
    adminVerify,
    UserValidation.getUserById,
    UserController.getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Admin
 */
router.put('/:id',
    RateLimitMiddleware.general(),
    protected,
    adminVerify,
    UserValidation.updateUser,
    UserController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Admin
 */
router.delete('/:id',
    RateLimitMiddleware.sensitive(),
    protected,
    adminVerify,
    UserValidation.deleteUser,
    UserController.deleteUser
);

/**
 * @route   POST /api/users/:id/ban
 * @desc    Ban user
 * @access  Admin
 */
router.post('/:id/ban',
    RateLimitMiddleware.sensitive(),
    protected,
    adminVerify,
    UserValidation.banUser,
    UserController.banUser
);

/**
 * @route   POST /api/users/:id/unban
 * @desc    Unban user
 * @access  Admin
 */
router.post('/:id/unban',
    RateLimitMiddleware.sensitive(),
    protected,
    adminVerify,
    UserValidation.unbanUser,
    UserController.unbanUser
);

// ==================== BULK OPERATIONS (ADMIN) ====================

/**
 * @route   POST /api/users/bulk-delete
 * @desc    Bulk delete users
 * @access  Admin
 */
router.post('/bulk-delete',
    RateLimitMiddleware.sensitive(),
    protected,
    adminVerify,
    UserValidation.bulkDeleteUsers,
    UserController.bulkDeleteUsers
);

/**
 * @route   PUT /api/users/bulk-update-status
 * @desc    Bulk update user status
 * @access  Admin
 */
router.put('/bulk-update-status',
    RateLimitMiddleware.sensitive(),
    protected,
    adminVerify,
    UserValidation.bulkUpdateStatus,
    UserController.bulkUpdateStatus
);

// ==================== FILE UPLOAD ROUTES ====================

/**
 * @route   POST /api/users/upload/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/upload/avatar',
    RateLimitMiddleware.upload(),
    protected,
    SanitizationMiddleware.fileUpload(),
    UserValidation.uploadAvatar,
    // Note: Add multer middleware here for actual file handling
    // upload.single('avatar'),
    (req, res) => {
        // Placeholder for file upload logic
        res.json({
            statusResponse: true,
            message: 'Avatar upload endpoint - add multer middleware for actual implementation',
            statusCode: 200
        });
    }
);

module.exports = router;