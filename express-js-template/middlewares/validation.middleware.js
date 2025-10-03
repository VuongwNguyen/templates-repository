const { body, param, query, validationResult } = require('express-validator');
const { errorResponse } = require('../util/responseHandle');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));

        throw new errorResponse({
            message: 'Validation failed',
            statusCode: 400,
            errors: errorMessages
        });
    }
    next();
};

/**
 * Common validation rules
 */
const validationRules = {
    // Email validation
    email: () =>
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),

    // Password validation
    password: () =>
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),

    // Confirm password
    confirmPassword: () =>
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password confirmation does not match password');
                }
                return true;
            }),

    // Name validation
    name: (field = 'name') =>
        body(field)
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage(`${field} must be between 2 and 50 characters`)
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage(`${field} can only contain letters and spaces`),

    // Phone validation
    phone: () =>
        body('phone')
            .optional()
            .isMobilePhone()
            .withMessage('Please provide a valid phone number'),

    // ID validation
    id: (field = 'id') =>
        param(field)
            .isMongoId()
            .withMessage(`Invalid ${field} format`),

    // UUID validation
    uuid: (field = 'id') =>
        param(field)
            .isUUID()
            .withMessage(`Invalid ${field} format`),

    // Pagination validation
    pagination: () => [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100')
    ],

    // Search validation
    search: () =>
        query('search')
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Search query must be between 1 and 100 characters'),

    // Date validation
    date: (field) =>
        body(field)
            .isISO8601()
            .withMessage(`${field} must be a valid date`),

    // URL validation
    url: (field) =>
        body(field)
            .optional()
            .isURL()
            .withMessage(`${field} must be a valid URL`),

    // File validation (for multer)
    file: (field, options = {}) => {
        const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'] } = options;

        return (req, res, next) => {
            if (!req.file && !req.files) {
                return next();
            }

            const file = req.file || req.files[field];
            if (!file) {
                return next();
            }

            // Check file size
            if (file.size > maxSize) {
                throw new errorResponse({
                    message: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
                    statusCode: 400
                });
            }

            // Check file type
            if (!allowedTypes.includes(file.mimetype)) {
                throw new errorResponse({
                    message: `File type must be one of: ${allowedTypes.join(', ')}`,
                    statusCode: 400
                });
            }

            next();
        };
    },

    // JSON validation
    json: (field) =>
        body(field)
            .custom((value) => {
                try {
                    JSON.parse(value);
                    return true;
                } catch (error) {
                    throw new Error(`${field} must be valid JSON`);
                }
            }),

    // Array validation
    array: (field, options = {}) => {
        const { min = 0, max = 10 } = options;
        return body(field)
            .isArray({ min, max })
            .withMessage(`${field} must be an array with ${min}-${max} items`);
    },

    // Custom regex validation
    regex: (field, pattern, message) =>
        body(field)
            .matches(pattern)
            .withMessage(message),

    // Sanitize HTML
    sanitizeHtml: (field) =>
        body(field)
            .customSanitizer((value) => {
                // Remove HTML tags
                return value ? value.replace(/<[^>]*>/g, '') : value;
            })
};

/**
 * Pre-built validation schemas for common use cases
 */
const validationSchemas = {
    // User registration
    userRegistration: [
        validationRules.name('firstName'),
        validationRules.name('lastName'),
        validationRules.email(),
        validationRules.password(),
        validationRules.confirmPassword(),
        validationRules.phone(),
        handleValidationErrors
    ],

    // User login
    userLogin: [
        validationRules.email(),
        body('password').notEmpty().withMessage('Password is required'),
        handleValidationErrors
    ],

    // Password reset
    passwordReset: [
        validationRules.email(),
        handleValidationErrors
    ],

    // Change password
    changePassword: [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        validationRules.password(),
        validationRules.confirmPassword(),
        handleValidationErrors
    ],

    // Update profile
    updateProfile: [
        validationRules.name('firstName'),
        validationRules.name('lastName'),
        validationRules.phone(),
        handleValidationErrors
    ],

    // Contact form
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
        handleValidationErrors
    ]
};

module.exports = {
    validationRules,
    validationSchemas,
    handleValidationErrors
};