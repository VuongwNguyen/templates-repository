/**
 * Jest Setup File
 * 
 * Global setup and configuration for tests
 */

// Set environment to test
process.env.NODE_ENV = 'test';

// Set test environment variables
process.env.ACCESS_JWT_SECRET = 'test-access-secret-key-for-testing-only';
process.env.REFRESH_JWT_SECRET = 'test-refresh-secret-key-for-testing-only';
process.env.EMAIL = 'test@example.com';
process.env.EMAIL_PASSWORD = 'test-password';
process.env.EMAIL_HOST = 'smtp.test.com';

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Mock console methods in tests to keep output clean
global.console = {
    ...console,
    // Uncomment these to suppress console output in tests
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
};

// Global test helpers
global.testHelpers = {
    // Helper to create test user data
    createTestUser: (overrides = {}) => ({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        phone: '+1234567890',
        terms: true,
        ...overrides
    }),

    // Helper to create test admin data
    createTestAdmin: (overrides = {}) => ({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'AdminPass123!',
        role: 'admin',
        status: 'active',
        ...overrides
    }),

    // Helper to generate random email
    randomEmail: () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`,

    // Helper to generate random string
    randomString: (length = 10) => Math.random().toString(36).substr(2, length),

    // Helper to wait for async operations
    wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))
};

// Mock external services
jest.mock('nodemailer', () => ({
    createTransporter: jest.fn(() => ({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
    }))
}));

// Global beforeEach setup
beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
});

// Global afterEach cleanup
afterEach(() => {
    // Clean up any test artifacts
});

// Global afterAll cleanup
afterAll(async () => {
    // Clean up any persistent resources
    await new Promise(resolve => setTimeout(resolve, 100));
});