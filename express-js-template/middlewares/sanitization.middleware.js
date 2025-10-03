const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');

/**
 * Sanitization middleware to clean and protect input data
 */
class SanitizationMiddleware {

    /**
     * Remove NoSQL injection attempts
     */
    static noSQLInjection() {
        return mongoSanitize({
            replaceWith: '_',
            onSanitize: ({ req, key }) => {
                console.warn(`NoSQL injection attempt detected: ${key} in ${req.method} ${req.path}`);
            }
        });
    }

    /**
     * Prevent XSS attacks by sanitizing HTML
     */
    static xssProtection() {
        return (req, res, next) => {
            // Sanitize request body
            if (req.body) {
                req.body = SanitizationMiddleware.sanitizeObject(req.body);
            }

            // Sanitize query parameters
            if (req.query) {
                req.query = SanitizationMiddleware.sanitizeObject(req.query);
            }

            // Sanitize URL parameters
            if (req.params) {
                req.params = SanitizationMiddleware.sanitizeObject(req.params);
            }

            next();
        };
    }

    /**
     * Prevent HTTP Parameter Pollution
     */
    static parameterPollution(whitelist = []) {
        return hpp({
            whitelist: ['sort', 'fields', 'page', 'limit', 'search', ...whitelist]
        });
    }

    /**
     * Sanitize object recursively
     */
    static sanitizeObject(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (typeof obj === 'string') {
            return SanitizationMiddleware.sanitizeString(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map(item => SanitizationMiddleware.sanitizeObject(item));
        }

        if (typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                const sanitizedKey = SanitizationMiddleware.sanitizeString(key);
                sanitized[sanitizedKey] = SanitizationMiddleware.sanitizeObject(value);
            }
            return sanitized;
        }

        return obj;
    }

    /**
     * Sanitize string value
     */
    static sanitizeString(str) {
        if (typeof str !== 'string') {
            return str;
        }

        // Remove XSS
        let sanitized = xss(str, {
            whiteList: {}, // No HTML tags allowed
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script']
        });

        // Remove null bytes
        sanitized = sanitized.replace(/\0/g, '');

        // Trim whitespace
        sanitized = sanitized.trim();

        return sanitized;
    }

    /**
     * Sanitize file uploads
     */
    static fileUpload() {
        return (req, res, next) => {
            if (req.file) {
                req.file.originalname = SanitizationMiddleware.sanitizeFileName(req.file.originalname);
            }

            if (req.files) {
                if (Array.isArray(req.files)) {
                    req.files.forEach(file => {
                        file.originalname = SanitizationMiddleware.sanitizeFileName(file.originalname);
                    });
                } else {
                    Object.keys(req.files).forEach(key => {
                        const files = req.files[key];
                        if (Array.isArray(files)) {
                            files.forEach(file => {
                                file.originalname = SanitizationMiddleware.sanitizeFileName(file.originalname);
                            });
                        } else {
                            files.originalname = SanitizationMiddleware.sanitizeFileName(files.originalname);
                        }
                    });
                }
            }

            next();
        };
    }

    /**
     * Sanitize file names
     */
    static sanitizeFileName(filename) {
        if (!filename) return filename;

        // Remove path traversal attempts
        let sanitized = filename.replace(/\.\./g, '');

        // Remove special characters except dots and hyphens
        sanitized = sanitized.replace(/[^a-zA-Z0-9.-]/g, '_');

        // Prevent multiple consecutive dots
        sanitized = sanitized.replace(/\.{2,}/g, '.');

        // Ensure filename is not empty
        if (!sanitized || sanitized === '.') {
            sanitized = 'file';
        }

        return sanitized;
    }

    /**
     * Remove empty strings and null values
     */
    static removeEmpty() {
        return (req, res, next) => {
            if (req.body) {
                req.body = SanitizationMiddleware.cleanEmptyValues(req.body);
            }

            if (req.query) {
                req.query = SanitizationMiddleware.cleanEmptyValues(req.query);
            }

            next();
        };
    }

    /**
     * Clean empty values from object
     */
    static cleanEmptyValues(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj
                .map(item => SanitizationMiddleware.cleanEmptyValues(item))
                .filter(item => item !== null && item !== undefined && item !== '');
        }

        if (typeof obj === 'object') {
            const cleaned = {};
            for (const [key, value] of Object.entries(obj)) {
                const cleanedValue = SanitizationMiddleware.cleanEmptyValues(value);
                if (cleanedValue !== null && cleanedValue !== undefined && cleanedValue !== '') {
                    cleaned[key] = cleanedValue;
                }
            }
            return cleaned;
        }

        return obj;
    }

    /**
     * Normalize data types
     */
    static normalizeTypes() {
        return (req, res, next) => {
            if (req.body) {
                req.body = SanitizationMiddleware.normalizeObject(req.body);
            }

            if (req.query) {
                req.query = SanitizationMiddleware.normalizeObject(req.query);
            }

            next();
        };
    }

    /**
     * Normalize object data types
     */
    static normalizeObject(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => SanitizationMiddleware.normalizeObject(item));
        }

        if (typeof obj === 'object') {
            const normalized = {};
            for (const [key, value] of Object.entries(obj)) {
                normalized[key] = SanitizationMiddleware.normalizeValue(value);
            }
            return normalized;
        }

        return SanitizationMiddleware.normalizeValue(obj);
    }

    /**
     * Normalize individual values
     */
    static normalizeValue(value) {
        if (typeof value !== 'string') {
            return value;
        }

        // Convert string numbers to actual numbers
        if (/^\d+$/.test(value)) {
            return parseInt(value, 10);
        }

        if (/^\d+\.\d+$/.test(value)) {
            return parseFloat(value);
        }

        // Convert string booleans to actual booleans
        if (value.toLowerCase() === 'true') {
            return true;
        }

        if (value.toLowerCase() === 'false') {
            return false;
        }

        // Convert 'null' string to null
        if (value.toLowerCase() === 'null') {
            return null;
        }

        return value;
    }

    /**
     * Combine all sanitization middlewares
     */
    static all(options = {}) {
        const {
            noSQLInjection = true,
            xssProtection = true,
            parameterPollution = true,
            removeEmpty = false,
            normalizeTypes = false,
            whitelist = []
        } = options;

        const middlewares = [];

        if (noSQLInjection) {
            middlewares.push(SanitizationMiddleware.noSQLInjection());
        }

        if (parameterPollution) {
            middlewares.push(SanitizationMiddleware.parameterPollution(whitelist));
        }

        if (xssProtection) {
            middlewares.push(SanitizationMiddleware.xssProtection());
        }

        if (removeEmpty) {
            middlewares.push(SanitizationMiddleware.removeEmpty());
        }

        if (normalizeTypes) {
            middlewares.push(SanitizationMiddleware.normalizeTypes());
        }

        return middlewares;
    }
}

module.exports = SanitizationMiddleware;