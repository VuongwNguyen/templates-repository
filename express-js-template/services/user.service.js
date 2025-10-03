/**
 * User Service
 * 
 * Contains business logic for user operations.
 * This layer handles complex business rules, validation, and coordination between different components.
 */

const bcrypt = require('bcryptjs');
const { userRepository } = require('../models/user.model');
const { errorResponse } = require('../util/responseHandle');
const TokenService = require('./token.service');

class UserService {

    /**
     * Register a new user
     */
    async register(userData) {
        const { email, password, firstName, lastName, phone, terms } = userData;

        // Check if terms are accepted
        if (!terms) {
            throw new errorResponse({
                message: 'You must accept the terms and conditions',
                statusCode: 400
            });
        }

        // Check if email already exists
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new errorResponse({
                message: 'Email already registered',
                statusCode: 409
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const newUser = await userRepository.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            role: 'user',
            status: 'active'
        });

        // Generate tokens
        const tokens = TokenService.generateToken({
            user_id: newUser.id,
            email: newUser.email,
            role: newUser.role
        });

        return {
            user: newUser.toSafeObject(),
            tokens
        };
    }

    /**
     * Login user
     */
    async login(email, password, rememberMe = false) {
        // Find user by email
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new errorResponse({
                message: 'Invalid email or password',
                statusCode: 401
            });
        }

        // Check if user is active
        if (!user.isActive) {
            throw new errorResponse({
                message: 'Account is inactive or banned',
                statusCode: 403
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new errorResponse({
                message: 'Invalid email or password',
                statusCode: 401
            });
        }

        // Update last login
        user.updateLastLogin();
        await userRepository.update(user.id, user);

        // Generate tokens with extended expiry if remember me
        const tokenPayload = {
            user_id: user.id,
            email: user.email,
            role: user.role
        };

        const tokens = rememberMe
            ? TokenService.generateToken(tokenPayload, { accessTokenExpiry: '7d', refreshTokenExpiry: '30d' })
            : TokenService.generateToken(tokenPayload);

        return {
            user: user.toSafeObject(),
            tokens
        };
    }

    /**
     * Get user profile
     */
    async getProfile(userId) {
        const user = await userRepository.findById(userId);
        if (!user || !user.isActive) {
            throw new errorResponse({
                message: 'User not found',
                statusCode: 404
            });
        }

        return user.toSafeObject();
    }

    /**
     * Update user profile
     */
    async updateProfile(userId, updateData) {
        const user = await userRepository.findById(userId);
        if (!user || !user.isActive) {
            throw new errorResponse({
                message: 'User not found',
                statusCode: 404
            });
        }

        // Check if email is being updated and if it already exists
        if (updateData.email && updateData.email !== user.email) {
            const emailExists = await userRepository.emailExists(updateData.email, userId);
            if (emailExists) {
                throw new errorResponse({
                    message: 'Email already in use',
                    statusCode: 409
                });
            }

            // If email is updated, mark as unverified
            updateData.emailVerified = false;
            updateData.emailVerifiedAt = null;
        }

        const updatedUser = await userRepository.update(userId, updateData);
        return updatedUser.toSafeObject();
    }

    /**
     * Change password
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await userRepository.findById(userId);
        if (!user || !user.isActive) {
            throw new errorResponse({
                message: 'User not found',
                statusCode: 404
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new errorResponse({
                message: 'Current password is incorrect',
                statusCode: 400
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await userRepository.update(userId, { password: hashedNewPassword });

        return { message: 'Password updated successfully' };
    }

    /**
     * Get all users (admin only)
     */
    async getAllUsers(options = {}) {
        const result = await userRepository.findAll(options);

        // Convert users to safe objects
        result.users = result.users.map(user => user.toSafeObject());

        return result;
    }

    /**
     * Get user by ID (admin only)
     */
    async getUserById(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new errorResponse({
                message: 'User not found',
                statusCode: 404
            });
        }

        return user.toSafeObject();
    }

    /**
     * Update user (admin only)
     */
    async updateUser(userId, updateData, adminId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new errorResponse({
                message: 'User not found',
                statusCode: 404
            });
        }

        // Prevent admin from updating their own role
        if (updateData.role && userId === adminId) {
            throw new errorResponse({
                message: 'Cannot change your own role',
                statusCode: 400
            });
        }

        // Check if email is being updated and if it already exists
        if (updateData.email && updateData.email !== user.email) {
            const emailExists = await userRepository.emailExists(updateData.email, userId);
            if (emailExists) {
                throw new errorResponse({
                    message: 'Email already in use',
                    statusCode: 409
                });
            }
        }

        // Hash password if provided
        if (updateData.password) {
            const saltRounds = 12;
            updateData.password = await bcrypt.hash(updateData.password, saltRounds);
        }

        const updatedUser = await userRepository.update(userId, updateData);
        return updatedUser.toSafeObject();
    }

    /**
     * Delete user (admin only)
     */
    async deleteUser(userId, adminId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new errorResponse({
                message: 'User not found',
                statusCode: 404
            });
        }

        // Prevent admin from deleting themselves
        if (userId === adminId) {
            throw new errorResponse({
                message: 'Cannot delete your own account',
                statusCode: 400
            });
        }

        await userRepository.delete(userId);
        return { message: 'User deleted successfully' };
    }

    /**
     * Ban user (admin only)
     */
    async banUser(userId, reason, duration = null, adminId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new errorResponse({
                message: 'User not found',
                statusCode: 404
            });
        }

        // Prevent admin from banning themselves
        if (userId === adminId) {
            throw new errorResponse({
                message: 'Cannot ban your own account',
                statusCode: 400
            });
        }

        // Prevent banning other admins
        if (user.role === 'admin') {
            throw new errorResponse({
                message: 'Cannot ban admin users',
                statusCode: 403
            });
        }

        const banData = {
            status: 'banned',
            metadata: {
                banReason: reason,
                bannedAt: new Date(),
                bannedBy: adminId,
                banDuration: duration
            }
        };

        const updatedUser = await userRepository.update(userId, banData);
        return {
            message: 'User banned successfully',
            user: updatedUser.toSafeObject()
        };
    }

    /**
     * Unban user (admin only)
     */
    async unbanUser(userId, adminId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new errorResponse({
                message: 'User not found',
                statusCode: 404
            });
        }

        if (user.status !== 'banned') {
            throw new errorResponse({
                message: 'User is not banned',
                statusCode: 400
            });
        }

        const unbanData = {
            status: 'active',
            metadata: {
                ...user.metadata,
                unbannedAt: new Date(),
                unbannedBy: adminId
            }
        };

        const updatedUser = await userRepository.update(userId, unbanData);
        return {
            message: 'User unbanned successfully',
            user: updatedUser.toSafeObject()
        };
    }

    /**
     * Search users
     */
    async searchUsers(searchQuery, options = {}) {
        const searchOptions = {
            ...options,
            search: searchQuery
        };

        const result = await userRepository.findAll(searchOptions);

        // Convert to public objects for search results
        result.users = result.users.map(user => user.toPublicObject());

        return result;
    }

    /**
     * Get user statistics (admin only)
     */
    async getUserStats() {
        const totalUsers = await userRepository.count();
        const activeUsers = await userRepository.count({ status: 'active' });
        const bannedUsers = await userRepository.count({ status: 'banned' });
        const adminUsers = await userRepository.count({ role: 'admin' });

        return {
            total: totalUsers,
            active: activeUsers,
            banned: bannedUsers,
            admins: adminUsers,
            regular: totalUsers - adminUsers
        };
    }

    /**
     * Verify user email
     */
    async verifyEmail(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new errorResponse({
                message: 'User not found',
                statusCode: 404
            });
        }

        if (user.emailVerified) {
            throw new errorResponse({
                message: 'Email already verified',
                statusCode: 400
            });
        }

        user.verifyEmail();
        await userRepository.update(userId, user);

        return {
            message: 'Email verified successfully',
            user: user.toSafeObject()
        };
    }

    /**
     * Update user preferences
     */
    async updatePreferences(userId, preferences) {
        const user = await userRepository.findById(userId);
        if (!user || !user.isActive) {
            throw new errorResponse({
                message: 'User not found',
                statusCode: 404
            });
        }

        const updatedPreferences = {
            ...user.preferences,
            ...preferences
        };

        const updatedUser = await userRepository.update(userId, {
            preferences: updatedPreferences
        });

        return updatedUser.toSafeObject();
    }

    /**
     * Delete user account (self-service)
     */
    async deleteAccount(userId, password) {
        const user = await userRepository.findById(userId);
        if (!user || !user.isActive) {
            throw new errorResponse({
                message: 'User not found',
                statusCode: 404
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new errorResponse({
                message: 'Password is incorrect',
                statusCode: 400
            });
        }

        // Prevent admin from deleting their account
        if (user.role === 'admin') {
            throw new errorResponse({
                message: 'Admin accounts cannot be self-deleted',
                statusCode: 403
            });
        }

        await userRepository.delete(userId);
        return { message: 'Account deleted successfully' };
    }
}

module.exports = new UserService();