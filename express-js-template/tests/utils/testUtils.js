/**
 * Test Utilities
 * 
 * Common utilities and helpers for testing
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class TestUtils {

    /**
     * Create test app instance
     */
    static createTestApp() {
        // Import app after environment variables are set
        const app = require('../app');
        return app;
    }

    /**
     * Generate JWT token for testing
     */
    static generateTestToken(payload = {}) {
        const defaultPayload = {
            user_id: 1,
            email: 'test@example.com',
            role: 'user'
        };

        return jwt.sign(
            { ...defaultPayload, ...payload },
            process.env.ACCESS_JWT_SECRET,
            { expiresIn: '1h' }
        );
    }

    /**
     * Generate admin JWT token for testing
     */
    static generateAdminToken(payload = {}) {
        const defaultPayload = {
            user_id: 1,
            email: 'admin@example.com',
            role: 'admin'
        };

        return jwt.sign(
            { ...defaultPayload, ...payload },
            process.env.ACCESS_JWT_SECRET,
            { expiresIn: '1h' }
        );
    }

    /**
     * Hash password for testing
     */
    static async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }

    /**
     * Create test user data
     */
    static createUserData(overrides = {}) {
        return {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'SecurePass123!',
            confirmPassword: 'SecurePass123!',
            phone: '+1234567890',
            terms: true,
            ...overrides
        };
    }

    /**
     * Create multiple test users
     */
    static createMultipleUsers(count = 3) {
        return Array.from({ length: count }, (_, index) => ({
            firstName: `User${index + 1}`,
            lastName: `Test${index + 1}`,
            email: `user${index + 1}@example.com`,
            password: 'SecurePass123!',
            role: 'user',
            status: 'active'
        }));
    }

    /**
     * API request helper with authentication
     */
    static authenticatedRequest(app, token) {
        return {
            get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
            post: (url) => request(app).post(url).set('Authorization', `Bearer ${token}`),
            put: (url) => request(app).put(url).set('Authorization', `Bearer ${token}`),
            delete: (url) => request(app).delete(url).set('Authorization', `Bearer ${token}`)
        };
    }

    /**
     * Clean database helper (mock implementation)
     */
    static async cleanDatabase() {
        // In a real implementation, this would clean test database
        const { userRepository } = require('../models/user.model');
        userRepository.users.clear();
        userRepository.nextId = 1;
    }

    /**
     * Seed test data
     */
    static async seedTestData() {
        const { userRepository } = require('../models/user.model');

        // Create test users
        const testUsers = [
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: await TestUtils.hashPassword('SecurePass123!'),
                role: 'user',
                status: 'active'
            },
            {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                password: await TestUtils.hashPassword('AdminPass123!'),
                role: 'admin',
                status: 'active'
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                password: await TestUtils.hashPassword('SecurePass123!'),
                role: 'user',
                status: 'inactive'
            }
        ];

        const createdUsers = [];
        for (const userData of testUsers) {
            const user = await userRepository.create(userData);
            createdUsers.push(user);
        }

        return createdUsers;
    }

    /**
     * Assert response structure
     */
    static expectSuccessResponse(response, expectedStatusCode = 200) {
        expect(response.status).toBe(expectedStatusCode);
        expect(response.body).toHaveProperty('statusResponse', true);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('statusCode', expectedStatusCode);
        expect(response.body).toHaveProperty('meta');
    }

    /**
     * Assert error response structure
     */
    static expectErrorResponse(response, expectedStatusCode) {
        expect(response.status).toBe(expectedStatusCode);
        expect(response.body).toHaveProperty('statusResponse', false);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('statusCode', expectedStatusCode);
    }

    /**
     * Assert validation error response
     */
    static expectValidationError(response) {
        TestUtils.expectErrorResponse(response, 400);
        expect(response.body.message).toBe('Validation failed');
    }

    /**
     * Assert unauthorized error
     */
    static expectUnauthorizedError(response) {
        TestUtils.expectErrorResponse(response, 401);
    }

    /**
     * Assert forbidden error
     */
    static expectForbiddenError(response) {
        TestUtils.expectErrorResponse(response, 403);
    }

    /**
     * Assert not found error
     */
    static expectNotFoundError(response) {
        TestUtils.expectErrorResponse(response, 404);
    }

    /**
     * Assert rate limit error
     */
    static expectRateLimitError(response) {
        TestUtils.expectErrorResponse(response, 429);
    }

    /**
     * Mock external service
     */
    static mockEmailService() {
        const mockSendMail = jest.fn().mockResolvedValue({
            messageId: 'test-message-id',
            response: '250 Message accepted'
        });

        jest.doMock('nodemailer', () => ({
            createTransporter: jest.fn(() => ({
                sendMail: mockSendMail
            }))
        }));

        return { mockSendMail };
    }

    /**
     * Generate test file data
     */
    static createTestFileData(overrides = {}) {
        return {
            fieldname: 'avatar',
            originalname: 'test-image.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            buffer: Buffer.from('test file content'),
            size: 1024,
            ...overrides
        };
    }

    /**
     * Simulate file upload
     */
    static simulateFileUpload(req, fileData) {
        req.file = TestUtils.createTestFileData(fileData);
        return req;
    }

    /**
     * Wait for async operations
     */
    static async wait(ms = 100) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generate random test data
     */
    static randomData = {
        email: () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@example.com`,
        string: (length = 10) => Math.random().toString(36).substr(2, length),
        number: (min = 1, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
        boolean: () => Math.random() < 0.5,
        phone: () => `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        date: () => new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    };

    /**
     * Performance testing helper
     */
    static async measurePerformance(fn) {
        const start = process.hrtime.bigint();
        const result = await fn();
        const end = process.hrtime.bigint();

        return {
            result,
            duration: Number(end - start) / 1000000, // Convert to milliseconds
            durationMs: Number(end - start) / 1000000
        };
    }

    /**
     * Stress test helper
     */
    static async stressTest(fn, iterations = 100, concurrency = 10) {
        const promises = [];
        const results = [];
        const errors = [];

        for (let i = 0; i < iterations; i++) {
            const promise = fn().then(result => {
                results.push(result);
            }).catch(error => {
                errors.push(error);
            });

            promises.push(promise);

            // Control concurrency
            if (promises.length >= concurrency) {
                await Promise.all(promises.splice(0, concurrency));
            }
        }

        // Wait for remaining promises
        await Promise.all(promises);

        return {
            totalIterations: iterations,
            successCount: results.length,
            errorCount: errors.length,
            results,
            errors
        };
    }
}

module.exports = TestUtils;