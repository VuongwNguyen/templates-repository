module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: [
        '**/tests/**/*.test.js',
        '**/tests/**/*.spec.js'
    ],
    collectCoverageFrom: [
        'app.js',
        'socket.js',
        'controllers/**/*.js',
        'middlewares/**/*.js',
        'models/**/*.js',
        'routes/**/*.js',
        'services/**/*.js',
        'util/**/*.js',
        'validations/**/*.js',
        '!**/node_modules/**',
        '!**/tests/**'
    ],
    coverageThreshold: {
        global: {
            branches: 75,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    coverageReporters: ['text', 'lcov', 'html'],
    coverageDirectory: 'coverage',
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,
    // Test timeout configuration
    testTimeout: 30000,
    // Parallel testing configuration
    maxWorkers: '50%',
    // Test patterns for different test types
    projects: [
        {
            displayName: 'unit',
            testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
            testEnvironment: 'node'
        },
        {
            displayName: 'integration',
            testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
            testEnvironment: 'node'
        },
        {
            displayName: 'e2e',
            testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
            testEnvironment: 'node'
        }
    ]
};