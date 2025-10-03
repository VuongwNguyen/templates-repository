/**
 * Database Test Helper
 * 
 * Helper for managing test database operations
 */

class DatabaseTestHelper {
    constructor() {
        this.originalData = new Map();
    }

    /**
     * Setup test database
     */
    async setup() {
        const { userRepository } = require('../../models/user.model');

        // Store original data
        this.originalData.set('users', new Map(userRepository.users));
        this.originalData.set('nextId', userRepository.nextId);

        // Clear database
        await this.clean();
    }

    /**
     * Clean test database
     */
    async clean() {
        const { userRepository } = require('../../models/user.model');

        userRepository.users.clear();
        userRepository.nextId = 1;
    }

    /**
     * Restore original database state
     */
    async restore() {
        const { userRepository } = require('../../models/user.model');

        if (this.originalData.has('users')) {
            userRepository.users = new Map(this.originalData.get('users'));
            userRepository.nextId = this.originalData.get('nextId');
        }
    }

    /**
     * Seed minimal test data
     */
    async seedMinimal() {
        const TestUtils = require('./testUtils');
        const { userRepository } = require('../../models/user.model');

        const testUser = await userRepository.create({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: await TestUtils.hashPassword('TestPass123!'),
            role: 'user',
            status: 'active'
        });

        const adminUser = await userRepository.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            password: await TestUtils.hashPassword('AdminPass123!'),
            role: 'admin',
            status: 'active'
        });

        return { testUser, adminUser };
    }

    /**
     * Seed full test data
     */
    async seedFull() {
        const TestUtils = require('./testUtils');
        const { userRepository } = require('../../models/user.model');

        const users = [];

        // Create regular users
        for (let i = 1; i <= 5; i++) {
            const user = await userRepository.create({
                firstName: `User${i}`,
                lastName: `Test${i}`,
                email: `user${i}@example.com`,
                password: await TestUtils.hashPassword('TestPass123!'),
                role: 'user',
                status: i <= 3 ? 'active' : 'inactive'
            });
            users.push(user);
        }

        // Create admin user
        const adminUser = await userRepository.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            password: await TestUtils.hashPassword('AdminPass123!'),
            role: 'admin',
            status: 'active'
        });
        users.push(adminUser);

        // Create moderator user
        const moderatorUser = await userRepository.create({
            firstName: 'Moderator',
            lastName: 'User',
            email: 'moderator@example.com',
            password: await TestUtils.hashPassword('ModeratorPass123!'),
            role: 'moderator',
            status: 'active'
        });
        users.push(moderatorUser);

        // Create banned user
        const bannedUser = await userRepository.create({
            firstName: 'Banned',
            lastName: 'User',
            email: 'banned@example.com',
            password: await TestUtils.hashPassword('BannedPass123!'),
            role: 'user',
            status: 'banned'
        });
        users.push(bannedUser);

        return users;
    }

    /**
     * Create test user with specific data
     */
    async createTestUser(userData = {}) {
        const TestUtils = require('./testUtils');
        const { userRepository } = require('../../models/user.model');

        const defaultData = {
            firstName: 'Test',
            lastName: 'User',
            email: TestUtils.randomData.email(),
            password: await TestUtils.hashPassword('TestPass123!'),
            role: 'user',
            status: 'active'
        };

        return await userRepository.create({ ...defaultData, ...userData });
    }

    /**
     * Get test data by role
     */
    async getUsersByRole(role) {
        const { userRepository } = require('../../models/user.model');
        const users = Array.from(userRepository.users.values());
        return users.filter(user => user.role === role);
    }

    /**
     * Get test data by status
     */
    async getUsersByStatus(status) {
        const { userRepository } = require('../../models/user.model');
        const users = Array.from(userRepository.users.values());
        return users.filter(user => user.status === status);
    }

    /**
     * Count users
     */
    async getUserCount() {
        const { userRepository } = require('../../models/user.model');
        return userRepository.users.size;
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        const { userRepository } = require('../../models/user.model');
        return await userRepository.findByEmail(email);
    }

    /**
     * Get user by ID
     */
    async getUserById(id) {
        const { userRepository } = require('../../models/user.model');
        return await userRepository.findById(id);
    }

    /**
     * Update user
     */
    async updateUser(id, updateData) {
        const { userRepository } = require('../../models/user.model');
        return await userRepository.update(id, updateData);
    }

    /**
     * Delete user
     */
    async deleteUser(id) {
        const { userRepository } = require('../../models/user.model');
        return await userRepository.delete(id);
    }
}

module.exports = DatabaseTestHelper;