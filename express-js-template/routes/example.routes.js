/**
 * Example routes demonstrating how to use validation and sanitization middlewares
 * 
 * This file shows practical examples of applying the validation and security middlewares
 * created in this template. Copy these patterns to your actual route files.
 */

const express = require('express');
const router = express.Router();

// Import validation schemas
const ValidationSchemas = require('../validations/schemas');

// Import rate limiting
const RateLimitMiddleware = require('../middlewares/rateLimit.middleware');

// Import sanitization
const SanitizationMiddleware = require('../middlewares/sanitization.middleware');

// Import response handlers
const { successfullyResponse, errorResponse } = require('../util/responseHandle');

/**
 * Example Authentication Routes
 */

// User Registration with validation and rate limiting
router.post('/register',
    RateLimitMiddleware.auth(), // Apply auth rate limiting
    ValidationSchemas.auth.register, // Apply validation
    async (req, res, next) => {
        try {
            // Your registration logic here
            const { firstName, lastName, email, password } = req.body;

            // Simulate user creation (replace with actual logic)
            const user = {
                id: '123',
                firstName,
                lastName,
                email,
                createdAt: new Date()
            };

            const response = new successfullyResponse({
                meta: { user },
                message: 'User registered successfully',
                statusCode: 201
            });

            response.json(res);
        } catch (error) {
            next(error);
        }
    }
);

// User Login with validation and rate limiting
router.post('/login',
    RateLimitMiddleware.auth(),
    ValidationSchemas.auth.login,
    async (req, res, next) => {
        try {
            const { email, password } = req.body;

            // Your login logic here
            const tokens = {
                accessToken: 'your-access-token',
                refreshToken: 'your-refresh-token'
            };

            const response = new successfullyResponse({
                meta: { tokens },
                message: 'Login successful'
            });

            response.json(res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * Example User Profile Routes
 */

// Update user profile
router.put('/profile',
    ValidationSchemas.user.updateProfile,
    async (req, res, next) => {
        try {
            const { firstName, lastName, phone, bio } = req.body;

            // Your profile update logic here
            const updatedUser = {
                firstName,
                lastName,
                phone,
                bio,
                updatedAt: new Date()
            };

            const response = new successfullyResponse({
                meta: { user: updatedUser },
                message: 'Profile updated successfully'
            });

            response.json(res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * Example File Upload Routes
 */

// Upload profile picture with file sanitization
router.post('/upload/profile-picture',
    RateLimitMiddleware.upload(),
    SanitizationMiddleware.fileUpload(), // Sanitize file names
    ValidationSchemas.upload.profilePicture,
    async (req, res, next) => {
        try {
            // Your file upload logic here
            const uploadResult = {
                filename: req.file?.filename || 'default.jpg',
                url: '/uploads/profile-pictures/default.jpg',
                uploadedAt: new Date()
            };

            const response = new successfullyResponse({
                meta: { upload: uploadResult },
                message: 'Profile picture uploaded successfully'
            });

            response.json(res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * Example Search Routes
 */

// Search users with pagination and filtering
router.get('/users/search',
    ValidationSchemas.search.users,
    async (req, res, next) => {
        try {
            const { search, page = 1, limit = 10, role, status } = req.query;

            // Your search logic here
            const searchResults = {
                users: [], // Your user search results
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: 0,
                    totalPages: 0
                },
                filters: { role, status }
            };

            const response = new successfullyResponse({
                meta: searchResults,
                message: 'Search completed successfully'
            });

            response.json(res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * Example Contact Routes
 */

// Contact form with email rate limiting
router.post('/contact',
    RateLimitMiddleware.email(),
    ValidationSchemas.contact.contactForm,
    async (req, res, next) => {
        try {
            const { name, email, subject, message, category } = req.body;

            // Your contact form logic here (send email, save to database, etc.)
            const contactSubmission = {
                id: '123',
                name,
                email,
                subject,
                message,
                category,
                submittedAt: new Date()
            };

            const response = new successfullyResponse({
                meta: { submission: contactSubmission },
                message: 'Contact form submitted successfully'
            });

            response.json(res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * Example Admin Routes with sensitive operations
 */

// Ban user (sensitive operation)
router.post('/admin/users/:userId/ban',
    RateLimitMiddleware.sensitive(), // Very strict rate limiting
    ValidationSchemas.admin.banUser,
    async (req, res, next) => {
        try {
            const { userId } = req.params;
            const { reason, duration } = req.body;

            // Your ban user logic here
            const banResult = {
                userId,
                reason,
                duration,
                bannedAt: new Date(),
                bannedBy: 'admin-user-id' // Get from authenticated user
            };

            const response = new successfullyResponse({
                meta: { ban: banResult },
                message: 'User banned successfully'
            });

            response.json(res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * Example of custom rate limiting per user
 */

// User-specific rate limited endpoint
router.post('/user-action',
    RateLimitMiddleware.perUser({ max: 50, windowMs: 15 * 60 * 1000 }),
    async (req, res, next) => {
        try {
            // Your user-specific action logic here

            const response = new successfullyResponse({
                message: 'Action completed successfully'
            });

            response.json(res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * Example of progressive rate limiting
 */

// Progressive rate limiting for API calls
router.get('/api-intensive',
    RateLimitMiddleware.progressive(),
    async (req, res, next) => {
        try {
            // Your intensive API logic here

            const response = new successfullyResponse({
                message: 'API call completed successfully'
            });

            response.json(res);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;