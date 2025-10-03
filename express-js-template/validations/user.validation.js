/**
 * User Validation Schemas
 * 
 * Specific validation rules for user-related endpoints
 */

const { body, param, query } = require('express-validator');
const { validationRules, handleValidationErrors } = require('../middlewares/validation.middleware');

const UserValidation = {

    // ==================== AUTH VALIDATIONS ====================

    register: [
        validationRules.name('firstName'),
        validationRules.name('lastName'),
        validationRules.email(),
        validationRules.password(),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password confirmation does not match password');
                }
                return true;
            }),
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

    // ==================== PROFILE VALIDATIONS ====================

    updateProfile: [
        body('firstName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('First name must be between 2 and 50 characters')
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('First name can only contain letters and spaces'),

        body('lastName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Last name must be between 2 and 50 characters')
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Last name can only contain letters and spaces'),

        body('email')
            .optional()
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),

        body('phone')
            .optional()
            .isMobilePhone()
            .withMessage('Please provide a valid phone number'),

        body('dateOfBirth')
            .optional()
            .isISO8601()
            .withMessage('Date of birth must be a valid date')
            .custom((value) => {
                const birthDate = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                if (age < 13) {
                    throw new Error('Must be at least 13 years old');
                }
                return true;
            }),

        body('gender')
            .optional()
            .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
            .withMessage('Invalid gender value'),

        body('bio')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Bio must not exceed 500 characters'),

        handleValidationErrors
    ],

    changePassword: [
        body('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),

        validationRules.password(),

        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password confirmation does not match password');
                }
                return true;
            }),

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
    ],

    updatePreferences: [
        body('emailNotifications')
            .optional()
            .isBoolean()
            .withMessage('Email notifications must be a boolean'),

        body('pushNotifications')
            .optional()
            .isBoolean()
            .withMessage('Push notifications must be a boolean'),

        body('smsNotifications')
            .optional()
            .isBoolean()
            .withMessage('SMS notifications must be a boolean'),

        body('language')
            .optional()
            .isIn(['en', 'vi', 'es', 'fr', 'de'])
            .withMessage('Invalid language code'),

        body('timezone')
            .optional()
            .isLength({ min: 1, max: 50 })
            .withMessage('Invalid timezone'),

        body('theme')
            .optional()
            .isIn(['light', 'dark', 'auto'])
            .withMessage('Theme must be light, dark, or auto'),

        handleValidationErrors
    ],

    // ==================== ADMIN VALIDATIONS ====================

    getUserById: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('User ID must be a positive integer'),

        handleValidationErrors
    ],

    updateUser: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('User ID must be a positive integer'),

        body('firstName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('First name must be between 2 and 50 characters'),

        body('lastName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Last name must be between 2 and 50 characters'),

        body('email')
            .optional()
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),

        body('role')
            .optional()
            .isIn(['user', 'admin', 'moderator'])
            .withMessage('Invalid role'),

        body('status')
            .optional()
            .isIn(['active', 'inactive', 'banned', 'pending'])
            .withMessage('Invalid status'),

        body('password')
            .optional()
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),

        handleValidationErrors
    ],

    deleteUser: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('User ID must be a positive integer'),

        handleValidationErrors
    ],

    banUser: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('User ID must be a positive integer'),

        body('reason')
            .trim()
            .isLength({ min: 10, max: 500 })
            .withMessage('Ban reason must be between 10 and 500 characters'),

        body('duration')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Duration must be a positive integer (days)'),

        handleValidationErrors
    ],

    unbanUser: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('User ID must be a positive integer'),

        handleValidationErrors
    ],

    // ==================== SEARCH & LISTING VALIDATIONS ====================

    getAllUsers: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),

        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),

        query('search')
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Search query must be between 1 and 100 characters'),

        query('role')
            .optional()
            .isIn(['user', 'admin', 'moderator'])
            .withMessage('Invalid role filter'),

        query('status')
            .optional()
            .isIn(['active', 'inactive', 'banned', 'pending'])
            .withMessage('Invalid status filter'),

        query('sortBy')
            .optional()
            .isIn(['firstName', 'lastName', 'email', 'createdAt', 'updatedAt', 'lastLoginAt'])
            .withMessage('Invalid sort field'),

        query('sortOrder')
            .optional()
            .isIn(['asc', 'desc'])
            .withMessage('Sort order must be asc or desc'),

        handleValidationErrors
    ],

    searchUsers: [
        query('search')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Search query is required and must be between 1 and 100 characters'),

        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),

        query('limit')
            .optional()
            .isInt({ min: 1, max: 50 })
            .withMessage('Limit must be between 1 and 50'),

        query('role')
            .optional()
            .isIn(['user', 'admin', 'moderator'])
            .withMessage('Invalid role filter'),

        query('status')
            .optional()
            .isIn(['active', 'inactive', 'banned', 'pending'])
            .withMessage('Invalid status filter'),

        handleValidationErrors
    ],

    // ==================== BULK OPERATIONS VALIDATIONS ====================

    bulkDeleteUsers: [
        body('userIds')
            .isArray({ min: 1, max: 50 })
            .withMessage('User IDs must be an array with 1-50 items'),

        body('userIds.*')
            .isInt({ min: 1 })
            .withMessage('Each user ID must be a positive integer'),

        handleValidationErrors
    ],

    bulkUpdateStatus: [
        body('userIds')
            .isArray({ min: 1, max: 50 })
            .withMessage('User IDs must be an array with 1-50 items'),

        body('userIds.*')
            .isInt({ min: 1 })
            .withMessage('Each user ID must be a positive integer'),

        body('status')
            .isIn(['active', 'inactive', 'banned'])
            .withMessage('Invalid status value'),

        handleValidationErrors
    ],

    // ==================== UTILITY VALIDATIONS ====================

    uploadAvatar: [
        body('description')
            .optional()
            .trim()
            .isLength({ max: 200 })
            .withMessage('Description must not exceed 200 characters'),

        handleValidationErrors
    ]
};

module.exports = UserValidation;