const { validationRules, handleValidationErrors } = require('../middlewares/validation.middleware');
const { body, param, query } = require('express-validator');

/**
 * Validation schemas for different API endpoints
 * Usage: Apply these in your route definitions
 * Example: router.post('/register', ValidationSchemas.auth.register, controller.register);
 */
const ValidationSchemas = {

    /**
     * Authentication related validations
     */
    auth: {
        register: [
            validationRules.name('firstName'),
            validationRules.name('lastName'),
            validationRules.email(),
            validationRules.password(),
            validationRules.confirmPassword(),
            validationRules.phone(),
            body('terms')
                .isBoolean()
                .withMessage('Terms acceptance is required')
                .custom((value) => {
                    if (!value) {
                        throw new Error('You must accept the terms and conditions');
                    }
                    return true;
                }),
            handleValidationErrors
        ],

        login: [
            validationRules.email(),
            body('password')
                .notEmpty()
                .withMessage('Password is required'),
            body('rememberMe')
                .optional()
                .isBoolean()
                .withMessage('Remember me must be a boolean'),
            handleValidationErrors
        ],

        forgotPassword: [
            validationRules.email(),
            handleValidationErrors
        ],

        resetPassword: [
            body('token')
                .notEmpty()
                .withMessage('Reset token is required'),
            validationRules.password(),
            validationRules.confirmPassword(),
            handleValidationErrors
        ],

        changePassword: [
            body('currentPassword')
                .notEmpty()
                .withMessage('Current password is required'),
            validationRules.password(),
            validationRules.confirmPassword(),
            handleValidationErrors
        ],

        refreshToken: [
            body('refreshToken')
                .notEmpty()
                .withMessage('Refresh token is required'),
            handleValidationErrors
        ]
    },

    /**
     * User profile validations
     */
    user: {
        updateProfile: [
            validationRules.name('firstName'),
            validationRules.name('lastName'),
            validationRules.phone(),
            body('bio')
                .optional()
                .trim()
                .isLength({ max: 500 })
                .withMessage('Bio must not exceed 500 characters'),
            validationRules.date('dateOfBirth'),
            body('gender')
                .optional()
                .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
                .withMessage('Invalid gender value'),
            handleValidationErrors
        ],

        updateEmail: [
            validationRules.email(),
            body('password')
                .notEmpty()
                .withMessage('Password is required for email change'),
            handleValidationErrors
        ],

        getUserById: [
            validationRules.uuid('userId'),
            handleValidationErrors
        ],

        deleteAccount: [
            body('password')
                .notEmpty()
                .withMessage('Password is required for account deletion'),
            body('confirmation')
                .equals('DELETE')
                .withMessage('Please type DELETE to confirm account deletion'),
            handleValidationErrors
        ]
    },

    /**
     * File upload validations
     */
    upload: {
        profilePicture: [
            // Note: File validation is handled by multer and sanitization middleware
            body('description')
                .optional()
                .trim()
                .isLength({ max: 200 })
                .withMessage('Description must not exceed 200 characters'),
            handleValidationErrors
        ],

        document: [
            body('title')
                .trim()
                .isLength({ min: 1, max: 100 })
                .withMessage('Title must be between 1 and 100 characters'),
            body('category')
                .isIn(['resume', 'certificate', 'portfolio', 'other'])
                .withMessage('Invalid document category'),
            handleValidationErrors
        ]
    },

    /**
     * Search and pagination validations
     */
    search: {
        general: [
            validationRules.search(),
            ...validationRules.pagination(),
            query('sortBy')
                .optional()
                .isIn(['name', 'createdAt', 'updatedAt', 'email'])
                .withMessage('Invalid sort field'),
            query('sortOrder')
                .optional()
                .isIn(['asc', 'desc'])
                .withMessage('Sort order must be asc or desc'),
            handleValidationErrors
        ],

        users: [
            validationRules.search(),
            ...validationRules.pagination(),
            query('role')
                .optional()
                .isIn(['admin', 'user', 'moderator'])
                .withMessage('Invalid role filter'),
            query('status')
                .optional()
                .isIn(['active', 'inactive', 'pending'])
                .withMessage('Invalid status filter'),
            handleValidationErrors
        ]
    },

    /**
     * Contact and communication validations
     */
    contact: {
        contactForm: [
            validationRules.name(),
            validationRules.email(),
            body('subject')
                .trim()
                .isLength({ min: 5, max: 100 })
                .withMessage('Subject must be between 5 and 100 characters'),
            body('message')
                .trim()
                .isLength({ min: 10, max: 1000 })
                .withMessage('Message must be between 10 and 1000 characters'),
            body('category')
                .optional()
                .isIn(['general', 'support', 'bug_report', 'feature_request'])
                .withMessage('Invalid category'),
            handleValidationErrors
        ],

        newsletter: [
            validationRules.email(),
            body('preferences')
                .optional()
                .isArray()
                .withMessage('Preferences must be an array'),
            handleValidationErrors
        ]
    },

    /**
     * Admin specific validations
     */
    admin: {
        createUser: [
            validationRules.name('firstName'),
            validationRules.name('lastName'),
            validationRules.email(),
            body('role')
                .isIn(['admin', 'user', 'moderator'])
                .withMessage('Invalid role'),
            body('permissions')
                .optional()
                .isArray()
                .withMessage('Permissions must be an array'),
            handleValidationErrors
        ],

        updateUserRole: [
            validationRules.uuid('userId'),
            body('role')
                .isIn(['admin', 'user', 'moderator'])
                .withMessage('Invalid role'),
            handleValidationErrors
        ],

        banUser: [
            validationRules.uuid('userId'),
            body('reason')
                .trim()
                .isLength({ min: 10, max: 500 })
                .withMessage('Ban reason must be between 10 and 500 characters'),
            body('duration')
                .optional()
                .isInt({ min: 1 })
                .withMessage('Duration must be a positive integer (days)'),
            handleValidationErrors
        ]
    },

    /**
     * Settings and configuration validations
     */
    settings: {
        updateNotifications: [
            body('emailNotifications')
                .isBoolean()
                .withMessage('Email notifications must be a boolean'),
            body('pushNotifications')
                .isBoolean()
                .withMessage('Push notifications must be a boolean'),
            body('smsNotifications')
                .isBoolean()
                .withMessage('SMS notifications must be a boolean'),
            body('frequency')
                .isIn(['immediate', 'daily', 'weekly', 'never'])
                .withMessage('Invalid notification frequency'),
            handleValidationErrors
        ],

        updatePrivacy: [
            body('profileVisibility')
                .isIn(['public', 'private', 'friends_only'])
                .withMessage('Invalid profile visibility setting'),
            body('showEmail')
                .isBoolean()
                .withMessage('Show email must be a boolean'),
            body('showPhone')
                .isBoolean()
                .withMessage('Show phone must be a boolean'),
            handleValidationErrors
        ]
    },

    /**
     * Custom validation for specific business logic
     */
    custom: {
        createPost: [
            body('title')
                .trim()
                .isLength({ min: 5, max: 200 })
                .withMessage('Title must be between 5 and 200 characters'),
            body('content')
                .trim()
                .isLength({ min: 20, max: 5000 })
                .withMessage('Content must be between 20 and 5000 characters'),
            body('tags')
                .optional()
                .isArray({ max: 10 })
                .withMessage('Maximum 10 tags allowed'),
            body('category')
                .isIn(['tech', 'lifestyle', 'business', 'education', 'other'])
                .withMessage('Invalid category'),
            body('published')
                .optional()
                .isBoolean()
                .withMessage('Published must be a boolean'),
            handleValidationErrors
        ],

        updatePost: [
            validationRules.uuid('postId'),
            body('title')
                .optional()
                .trim()
                .isLength({ min: 5, max: 200 })
                .withMessage('Title must be between 5 and 200 characters'),
            body('content')
                .optional()
                .trim()
                .isLength({ min: 20, max: 5000 })
                .withMessage('Content must be between 20 and 5000 characters'),
            body('tags')
                .optional()
                .isArray({ max: 10 })
                .withMessage('Maximum 10 tags allowed'),
            handleValidationErrors
        ]
    }
};

module.exports = ValidationSchemas;