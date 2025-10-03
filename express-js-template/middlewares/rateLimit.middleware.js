const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../util/responseHandle');

/**
 * Rate limiting configurations for different endpoints
 */
class RateLimitMiddleware {

    /**
     * General API rate limiting
     */
    static general() {
        return rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
            standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers
            handler: (req, res, next) => {
                throw new errorResponse({
                    message: 'Too many requests from this IP, please try again later.',
                    statusCode: 429
                });
            }
        });
    }

    /**
     * Strict rate limiting for authentication endpoints
     */
    static auth() {
        return rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // Limit each IP to 5 login requests per windowMs
            skipSuccessfulRequests: true, // Don't count successful requests
            handler: (req, res, next) => {
                throw new errorResponse({
                    message: 'Too many authentication attempts, please try again later.',
                    statusCode: 429
                });
            }
        });
    }

    /**
     * Rate limiting for password reset requests
     */
    static passwordReset() {
        return rateLimit({
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 3, // Limit each IP to 3 password reset requests per hour
            handler: (req, res, next) => {
                throw new errorResponse({
                    message: 'Too many password reset attempts, please try again later.',
                    statusCode: 429
                });
            }
        });
    }

    /**
     * Rate limiting for email sending
     */
    static email() {
        return rateLimit({
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 10, // Limit each IP to 10 emails per hour
            handler: (req, res, next) => {
                throw new errorResponse({
                    message: 'Too many emails sent, please try again later.',
                    statusCode: 429
                });
            }
        });
    }

    /**
     * Rate limiting for file uploads
     */
    static upload() {
        return rateLimit({
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 20, // Limit each IP to 20 uploads per hour
            handler: (req, res, next) => {
                throw new errorResponse({
                    message: 'Too many file uploads, please try again later.',
                    statusCode: 429
                });
            }
        });
    }

    /**
     * Very strict rate limiting for sensitive operations
     */
    static sensitive() {
        return rateLimit({
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 3, // Limit each IP to 3 requests per hour
            handler: (req, res, next) => {
                throw new errorResponse({
                    message: 'Too many requests for sensitive operation, please try again later.',
                    statusCode: 429
                });
            }
        });
    }

    /**
     * Custom rate limiting
     */
    static custom(options = {}) {
        const {
            windowMs = 15 * 60 * 1000, // 15 minutes
            max = 100,
            message = 'Too many requests, please try again later.',
            skipSuccessfulRequests = false,
            skipFailedRequests = false
        } = options;

        return rateLimit({
            windowMs,
            max,
            skipSuccessfulRequests,
            skipFailedRequests,
            handler: (req, res, next) => {
                throw new errorResponse({
                    message,
                    statusCode: 429
                });
            }
        });
    }

    /**
     * Rate limiting based on user ID (for authenticated routes)
     */
    static perUser(options = {}) {
        const {
            windowMs = 15 * 60 * 1000, // 15 minutes
            max = 100,
            message = 'Too many requests, please try again later.'
        } = options;

        return rateLimit({
            windowMs,
            max,
            keyGenerator: (req) => {
                // Use user ID if available, otherwise fall back to IP
                return req.body?.user_id || req.user?.id || req.ip;
            },
            handler: (req, res, next) => {
                throw new errorResponse({
                    message,
                    statusCode: 429
                });
            }
        });
    }

    /**
     * Progressive rate limiting - gets stricter as attempts increase
     */
    static progressive() {
        const store = new Map();

        return (req, res, next) => {
            const key = req.ip;
            const now = Date.now();
            const windowMs = 15 * 60 * 1000; // 15 minutes

            // Clean old entries
            for (const [storedKey, data] of store.entries()) {
                if (now - data.resetTime > windowMs) {
                    store.delete(storedKey);
                }
            }

            if (!store.has(key)) {
                store.set(key, {
                    count: 1,
                    resetTime: now + windowMs
                });
                return next();
            }

            const userData = store.get(key);
            userData.count++;

            // Progressive limits: 100, 50, 20, 10, 5
            let maxRequests = 100;
            if (userData.count > 100) maxRequests = 50;
            if (userData.count > 150) maxRequests = 20;
            if (userData.count > 170) maxRequests = 10;
            if (userData.count > 180) maxRequests = 5;

            const remainingTime = userData.resetTime - now;
            const currentWindowRequests = userData.count - Math.floor((now - (userData.resetTime - windowMs)) / (windowMs / maxRequests));

            if (currentWindowRequests > maxRequests) {
                throw new errorResponse({
                    message: `Rate limit exceeded. Too many requests. Try again in ${Math.ceil(remainingTime / 1000)} seconds.`,
                    statusCode: 429
                });
            }

            next();
        };
    }
}

module.exports = RateLimitMiddleware;