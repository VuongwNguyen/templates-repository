/**
 * Unit Tests for User Service
 * 
 * Tests for user service business logic
 */

const UserService = require('../../services/user.service');
const { userRepository } = require('../../models/user.model');
const TestUtils = require('../utils/testUtils');
const DatabaseTestHelper = require('../utils/databaseHelper');
const bcrypt = require('bcryptjs');

describe('User Service', () => {
    let dbHelper;

    beforeAll(async () => {
        dbHelper = new DatabaseTestHelper();
        await dbHelper.setup();
    });

    beforeEach(async () => {
        await dbHelper.clean();
    });

    afterAll(async () => {
        await dbHelper.restore();
    });

    describe('register', () => {
        test('should register a new user successfully', async () => {
            const userData = TestUtils.createUserData();

            const result = await UserService.register(userData);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('tokens');
            expect(result.user.email).toBe(userData.email);
            expect(result.user.firstName).toBe(userData.firstName);
            expect(result.user).not.toHaveProperty('password');
            expect(result.tokens).toHaveProperty('accessToken');
            expect(result.tokens).toHaveProperty('refreshToken');
        });

        test('should throw error if terms not accepted', async () => {
            const userData = TestUtils.createUserData({ terms: false });

            await expect(UserService.register(userData))
                .rejects
                .toThrow('You must accept the terms and conditions');
        });

        test('should throw error if email already exists', async () => {
            const userData = TestUtils.createUserData();

            // Create first user
            await UserService.register(userData);

            // Try to register with same email
            await expect(UserService.register(userData))
                .rejects
                .toThrow('Email already registered');
        });

        test('should hash password correctly', async () => {
            const userData = TestUtils.createUserData();

            await UserService.register(userData);

            const user = await userRepository.findByEmail(userData.email);
            expect(user.password).not.toBe(userData.password);

            const isPasswordValid = await bcrypt.compare(userData.password, user.password);
            expect(isPasswordValid).toBe(true);
        });
    });

    describe('login', () => {
        test('should login user successfully', async () => {
            const userData = TestUtils.createUserData();
            await UserService.register(userData);

            const result = await UserService.login(userData.email, userData.password);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('tokens');
            expect(result.user.email).toBe(userData.email);
            expect(result.user).not.toHaveProperty('password');
        });

        test('should throw error for invalid email', async () => {
            await expect(UserService.login('nonexistent@example.com', 'password'))
                .rejects
                .toThrow('Invalid email or password');
        });

        test('should throw error for invalid password', async () => {
            const userData = TestUtils.createUserData();
            await UserService.register(userData);

            await expect(UserService.login(userData.email, 'wrongpassword'))
                .rejects
                .toThrow('Invalid email or password');
        });

        test('should throw error for inactive user', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);

            // Make user inactive
            await userRepository.update(user.id, { status: 'inactive' });

            await expect(UserService.login(userData.email, userData.password))
                .rejects
                .toThrow('Account is inactive or banned');
        });

        test('should update last login time', async () => {
            const userData = TestUtils.createUserData();
            await UserService.register(userData);

            const beforeLogin = new Date();
            await UserService.login(userData.email, userData.password);

            const user = await userRepository.findByEmail(userData.email);
            expect(user.lastLoginAt).toBeInstanceOf(Date);
            expect(user.lastLoginAt.getTime()).toBeGreaterThan(beforeLogin.getTime() - 1000);
        });
    });

    describe('getProfile', () => {
        test('should get user profile successfully', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);

            const profile = await UserService.getProfile(user.id);

            expect(profile.id).toBe(user.id);
            expect(profile.email).toBe(user.email);
            expect(profile).not.toHaveProperty('password');
        });

        test('should throw error for non-existent user', async () => {
            await expect(UserService.getProfile(999))
                .rejects
                .toThrow('User not found');
        });

        test('should throw error for inactive user', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);

            await userRepository.update(user.id, { status: 'inactive' });

            await expect(UserService.getProfile(user.id))
                .rejects
                .toThrow('User not found');
        });
    });

    describe('updateProfile', () => {
        test('should update profile successfully', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);

            const updateData = {
                firstName: 'Updated',
                lastName: 'Name',
                phone: '+9876543210'
            };

            const updatedUser = await UserService.updateProfile(user.id, updateData);

            expect(updatedUser.firstName).toBe(updateData.firstName);
            expect(updatedUser.lastName).toBe(updateData.lastName);
            expect(updatedUser.phone).toBe(updateData.phone);
        });

        test('should throw error for non-existent user', async () => {
            await expect(UserService.updateProfile(999, {}))
                .rejects
                .toThrow('User not found');
        });

        test('should throw error when updating to existing email', async () => {
            const userData1 = TestUtils.createUserData();
            const userData2 = TestUtils.createUserData({ email: 'different@example.com' });

            const { user: user1 } = await UserService.register(userData1);
            await UserService.register(userData2);

            await expect(UserService.updateProfile(user1.id, { email: userData2.email }))
                .rejects
                .toThrow('Email already in use');
        });

        test('should mark email as unverified when email is updated', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);

            // Verify email first
            await userRepository.update(user.id, { emailVerified: true, emailVerifiedAt: new Date() });

            const updatedUser = await UserService.updateProfile(user.id, { email: 'newemail@example.com' });

            expect(updatedUser.emailVerified).toBe(false);
            expect(updatedUser.emailVerifiedAt).toBeNull();
        });
    });

    describe('changePassword', () => {
        test('should change password successfully', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);

            const newPassword = 'NewSecurePass123!';
            const result = await UserService.changePassword(user.id, userData.password, newPassword);

            expect(result.message).toBe('Password updated successfully');

            // Verify new password works
            const loginResult = await UserService.login(userData.email, newPassword);
            expect(loginResult.user.id).toBe(user.id);
        });

        test('should throw error for incorrect current password', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);

            await expect(UserService.changePassword(user.id, 'wrongpassword', 'NewPass123!'))
                .rejects
                .toThrow('Current password is incorrect');
        });

        test('should throw error for non-existent user', async () => {
            await expect(UserService.changePassword(999, 'password', 'newpassword'))
                .rejects
                .toThrow('User not found');
        });
    });

    describe('getAllUsers', () => {
        test('should get all users with pagination', async () => {
            await dbHelper.seedFull();

            const result = await UserService.getAllUsers({ page: 1, limit: 5 });

            expect(result).toHaveProperty('users');
            expect(result).toHaveProperty('pagination');
            expect(Array.isArray(result.users)).toBe(true);
            expect(result.users.length).toBeLessThanOrEqual(5);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(5);
        });

        test('should filter users by role', async () => {
            await dbHelper.seedFull();

            const result = await UserService.getAllUsers({ role: 'admin' });

            expect(result.users.every(user => user.role === 'admin')).toBe(true);
        });

        test('should filter users by status', async () => {
            await dbHelper.seedFull();

            const result = await UserService.getAllUsers({ status: 'active' });

            expect(result.users.every(user => user.status === 'active')).toBe(true);
        });

        test('should search users by name or email', async () => {
            await dbHelper.seedFull();

            const result = await UserService.getAllUsers({ search: 'admin' });

            expect(result.users.some(user =>
                user.firstName.toLowerCase().includes('admin') ||
                user.lastName.toLowerCase().includes('admin') ||
                user.email.toLowerCase().includes('admin')
            )).toBe(true);
        });
    });

    describe('deleteUser', () => {
        test('should delete user successfully', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);
            const adminData = TestUtils.createUserData({ email: 'admin@example.com', role: 'admin' });
            const { user: admin } = await UserService.register(adminData);

            const result = await UserService.deleteUser(user.id, admin.id);

            expect(result.message).toBe('User deleted successfully');

            const deletedUser = await userRepository.findById(user.id);
            expect(deletedUser.deletedAt).toBeInstanceOf(Date);
        });

        test('should not allow admin to delete themselves', async () => {
            const adminData = TestUtils.createUserData({ email: 'admin@example.com', role: 'admin' });
            const { user: admin } = await UserService.register(adminData);

            await expect(UserService.deleteUser(admin.id, admin.id))
                .rejects
                .toThrow('Cannot delete your own account');
        });
    });

    describe('banUser', () => {
        test('should ban user successfully', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);
            const adminData = TestUtils.createUserData({ email: 'admin@example.com', role: 'admin' });
            const { user: admin } = await UserService.register(adminData);

            const result = await UserService.banUser(user.id, 'Violation of terms', 30, admin.id);

            expect(result.message).toBe('User banned successfully');
            expect(result.user.status).toBe('banned');
        });

        test('should not allow admin to ban themselves', async () => {
            const adminData = TestUtils.createUserData({ email: 'admin@example.com', role: 'admin' });
            const { user: admin } = await UserService.register(adminData);

            await expect(UserService.banUser(admin.id, 'reason', 30, admin.id))
                .rejects
                .toThrow('Cannot ban your own account');
        });

        test('should not allow banning other admins', async () => {
            const admin1Data = TestUtils.createUserData({ email: 'admin1@example.com', role: 'admin' });
            const admin2Data = TestUtils.createUserData({ email: 'admin2@example.com', role: 'admin' });

            const { user: admin1 } = await UserService.register(admin1Data);
            const { user: admin2 } = await UserService.register(admin2Data);

            await expect(UserService.banUser(admin2.id, 'reason', 30, admin1.id))
                .rejects
                .toThrow('Cannot ban admin users');
        });
    });

    describe('searchUsers', () => {
        test('should search users and return public data only', async () => {
            await dbHelper.seedFull();

            const result = await UserService.searchUsers('user');

            expect(result).toHaveProperty('users');
            expect(Array.isArray(result.users)).toBe(true);

            if (result.users.length > 0) {
                const user = result.users[0];
                expect(user).toHaveProperty('id');
                expect(user).toHaveProperty('firstName');
                expect(user).not.toHaveProperty('email'); // Public object shouldn't have email
                expect(user).not.toHaveProperty('password');
            }
        });
    });

    describe('getUserStats', () => {
        test('should return user statistics', async () => {
            await dbHelper.seedFull();

            const stats = await UserService.getUserStats();

            expect(stats).toHaveProperty('total');
            expect(stats).toHaveProperty('active');
            expect(stats).toHaveProperty('banned');
            expect(stats).toHaveProperty('admins');
            expect(stats).toHaveProperty('regular');
            expect(typeof stats.total).toBe('number');
            expect(typeof stats.active).toBe('number');
        });
    });

    describe('verifyEmail', () => {
        test('should verify email successfully', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);

            const result = await UserService.verifyEmail(user.id);

            expect(result.message).toBe('Email verified successfully');
            expect(result.user.emailVerified).toBe(true);
            expect(result.user.emailVerifiedAt).toBeInstanceOf(Date);
        });

        test('should throw error if email already verified', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);

            // Verify email first
            await UserService.verifyEmail(user.id);

            // Try to verify again
            await expect(UserService.verifyEmail(user.id))
                .rejects
                .toThrow('Email already verified');
        });
    });

    describe('updatePreferences', () => {
        test('should update user preferences', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);

            const preferences = {
                emailNotifications: false,
                theme: 'dark',
                language: 'vi'
            };

            const result = await UserService.updatePreferences(user.id, preferences);

            expect(result.preferences.emailNotifications).toBe(false);
            expect(result.preferences.theme).toBe('dark');
            expect(result.preferences.language).toBe('vi');
        });

        test('should merge with existing preferences', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);

            // Set initial preferences
            await userRepository.update(user.id, {
                preferences: { emailNotifications: true, theme: 'light' }
            });

            // Update only one preference
            const result = await UserService.updatePreferences(user.id, { theme: 'dark' });

            expect(result.preferences.emailNotifications).toBe(true); // Should remain
            expect(result.preferences.theme).toBe('dark'); // Should be updated
        });
    });

    describe('deleteAccount', () => {
        test('should delete account successfully', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);

            const result = await UserService.deleteAccount(user.id, userData.password);

            expect(result.message).toBe('Account deleted successfully');

            const deletedUser = await userRepository.findById(user.id);
            expect(deletedUser.deletedAt).toBeInstanceOf(Date);
        });

        test('should throw error for incorrect password', async () => {
            const userData = TestUtils.createUserData();
            const { user } = await UserService.register(userData);

            await expect(UserService.deleteAccount(user.id, 'wrongpassword'))
                .rejects
                .toThrow('Password is incorrect');
        });

        test('should not allow admin to delete their account', async () => {
            const adminData = TestUtils.createUserData({ email: 'admin@example.com', role: 'admin' });
            const { user: admin } = await UserService.register(adminData);

            // Update user role to admin
            await userRepository.update(admin.id, { role: 'admin' });

            await expect(UserService.deleteAccount(admin.id, adminData.password))
                .rejects
                .toThrow('Admin accounts cannot be self-deleted');
        });
    });
});