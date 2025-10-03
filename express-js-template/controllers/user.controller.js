/**
 * User Controller
 * 
 * Handles HTTP requests and responses for user-related operations.
 * This layer is responsible for request/response handling, calling appropriate services,
 * and returning properly formatted responses.
 */

const UserService = require('../services/user.service');
const { successfullyResponse, errorResponse } = require('../util/responseHandle');
const asyncHandler = require('../middlewares/asyncHandler');

class UserController {

    /**
     * POST /api/users/register
     * Register a new user
     */
    register = asyncHandler(async (req, res) => {
        const result = await UserService.register(req.body);

        const response = new successfullyResponse({
            meta: result,
            message: 'User registered successfully',
            statusCode: 201
        });

        response.json(res);
    });

    /**
     * POST /api/users/login
     * User login
     */
    login = asyncHandler(async (req, res) => {
        const { email, password, rememberMe } = req.body;
        const result = await UserService.login(email, password, rememberMe);

        const response = new successfullyResponse({
            meta: result,
            message: 'Login successful'
        });

        response.json(res);
    });

    /**
     * GET /api/users/profile
     * Get current user profile
     */
    getProfile = asyncHandler(async (req, res) => {
        const userId = req.body.user_id; // Set by auth middleware
        const user = await UserService.getProfile(userId);

        const response = new successfullyResponse({
            meta: { user },
            message: 'Profile retrieved successfully'
        });

        response.json(res);
    });

    /**
     * PUT /api/users/profile
     * Update current user profile
     */
    updateProfile = asyncHandler(async (req, res) => {
        const userId = req.body.user_id; // Set by auth middleware
        const updateData = req.body;
        delete updateData.user_id; // Remove user_id from update data

        const user = await UserService.updateProfile(userId, updateData);

        const response = new successfullyResponse({
            meta: { user },
            message: 'Profile updated successfully'
        });

        response.json(res);
    });

    /**
     * PUT /api/users/change-password
     * Change user password
     */
    changePassword = asyncHandler(async (req, res) => {
        const userId = req.body.user_id; // Set by auth middleware
        const { currentPassword, password } = req.body;

        const result = await UserService.changePassword(userId, currentPassword, password);

        const response = new successfullyResponse({
            meta: result,
            message: 'Password changed successfully'
        });

        response.json(res);
    });

    /**
     * DELETE /api/users/account
     * Delete current user account
     */
    deleteAccount = asyncHandler(async (req, res) => {
        const userId = req.body.user_id; // Set by auth middleware
        const { password } = req.body;

        const result = await UserService.deleteAccount(userId, password);

        const response = new successfullyResponse({
            meta: result,
            message: 'Account deleted successfully'
        });

        response.json(res);
    });

    /**
     * PUT /api/users/preferences
     * Update user preferences
     */
    updatePreferences = asyncHandler(async (req, res) => {
        const userId = req.body.user_id; // Set by auth middleware
        const preferences = req.body;
        delete preferences.user_id; // Remove user_id from preferences

        const user = await UserService.updatePreferences(userId, preferences);

        const response = new successfullyResponse({
            meta: { user },
            message: 'Preferences updated successfully'
        });

        response.json(res);
    });

    /**
     * PUT /api/users/verify-email
     * Verify user email
     */
    verifyEmail = asyncHandler(async (req, res) => {
        const userId = req.body.user_id; // Set by auth middleware

        const result = await UserService.verifyEmail(userId);

        const response = new successfullyResponse({
            meta: result,
            message: 'Email verified successfully'
        });

        response.json(res);
    });

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * GET /api/users
     * Get all users (admin only)
     */
    getAllUsers = asyncHandler(async (req, res) => {
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            search: req.query.search || '',
            role: req.query.role || null,
            status: req.query.status || null,
            sortBy: req.query.sortBy || 'createdAt',
            sortOrder: req.query.sortOrder || 'desc'
        };

        const result = await UserService.getAllUsers(options);

        const response = new successfullyResponse({
            meta: result,
            message: 'Users retrieved successfully'
        });

        response.json(res);
    });

    /**
     * GET /api/users/:id
     * Get user by ID (admin only)
     */
    getUserById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const user = await UserService.getUserById(id);

        const response = new successfullyResponse({
            meta: { user },
            message: 'User retrieved successfully'
        });

        response.json(res);
    });

    /**
     * PUT /api/users/:id
     * Update user by ID (admin only)
     */
    updateUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const adminId = req.body.user_id; // Set by auth middleware
        const updateData = req.body;
        delete updateData.user_id; // Remove admin user_id from update data

        const user = await UserService.updateUser(id, updateData, adminId);

        const response = new successfullyResponse({
            meta: { user },
            message: 'User updated successfully'
        });

        response.json(res);
    });

    /**
     * DELETE /api/users/:id
     * Delete user by ID (admin only)
     */
    deleteUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const adminId = req.body.user_id; // Set by auth middleware

        const result = await UserService.deleteUser(id, adminId);

        const response = new successfullyResponse({
            meta: result,
            message: 'User deleted successfully'
        });

        response.json(res);
    });

    /**
     * POST /api/users/:id/ban
     * Ban user (admin only)
     */
    banUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const adminId = req.body.user_id; // Set by auth middleware
        const { reason, duration } = req.body;

        const result = await UserService.banUser(id, reason, duration, adminId);

        const response = new successfullyResponse({
            meta: result,
            message: 'User banned successfully'
        });

        response.json(res);
    });

    /**
     * POST /api/users/:id/unban
     * Unban user (admin only)
     */
    unbanUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const adminId = req.body.user_id; // Set by auth middleware

        const result = await UserService.unbanUser(id, adminId);

        const response = new successfullyResponse({
            meta: result,
            message: 'User unbanned successfully'
        });

        response.json(res);
    });

    /**
     * GET /api/users/search
     * Search users
     */
    searchUsers = asyncHandler(async (req, res) => {
        const { search } = req.query;
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            role: req.query.role || null,
            status: req.query.status || null,
            sortBy: req.query.sortBy || 'createdAt',
            sortOrder: req.query.sortOrder || 'desc'
        };

        const result = await UserService.searchUsers(search, options);

        const response = new successfullyResponse({
            meta: result,
            message: 'Search completed successfully'
        });

        response.json(res);
    });

    /**
     * GET /api/users/stats
     * Get user statistics (admin only)
     */
    getUserStats = asyncHandler(async (req, res) => {
        const stats = await UserService.getUserStats();

        const response = new successfullyResponse({
            meta: { stats },
            message: 'User statistics retrieved successfully'
        });

        response.json(res);
    });

    // ==================== BULK OPERATIONS ====================

    /**
     * POST /api/users/bulk-delete
     * Bulk delete users (admin only)
     */
    bulkDeleteUsers = asyncHandler(async (req, res) => {
        const { userIds } = req.body;
        const adminId = req.body.user_id; // Set by auth middleware

        if (!Array.isArray(userIds) || userIds.length === 0) {
            throw new errorResponse({
                message: 'User IDs array is required',
                statusCode: 400
            });
        }

        const results = [];
        let successCount = 0;
        let errorCount = 0;

        for (const userId of userIds) {
            try {
                await UserService.deleteUser(userId, adminId);
                results.push({ userId, status: 'success' });
                successCount++;
            } catch (error) {
                results.push({ userId, status: 'error', message: error.message });
                errorCount++;
            }
        }

        const response = new successfullyResponse({
            meta: {
                results,
                summary: {
                    total: userIds.length,
                    success: successCount,
                    errors: errorCount
                }
            },
            message: `Bulk delete completed. ${successCount} successful, ${errorCount} errors.`
        });

        response.json(res);
    });

    /**
     * PUT /api/users/bulk-update-status
     * Bulk update user status (admin only)
     */
    bulkUpdateStatus = asyncHandler(async (req, res) => {
        const { userIds, status } = req.body;
        const adminId = req.body.user_id; // Set by auth middleware

        if (!Array.isArray(userIds) || userIds.length === 0) {
            throw new errorResponse({
                message: 'User IDs array is required',
                statusCode: 400
            });
        }

        if (!['active', 'inactive', 'banned'].includes(status)) {
            throw new errorResponse({
                message: 'Invalid status value',
                statusCode: 400
            });
        }

        const results = [];
        let successCount = 0;
        let errorCount = 0;

        for (const userId of userIds) {
            try {
                await UserService.updateUser(userId, { status }, adminId);
                results.push({ userId, status: 'success' });
                successCount++;
            } catch (error) {
                results.push({ userId, status: 'error', message: error.message });
                errorCount++;
            }
        }

        const response = new successfullyResponse({
            meta: {
                results,
                summary: {
                    total: userIds.length,
                    success: successCount,
                    errors: errorCount
                }
            },
            message: `Bulk status update completed. ${successCount} successful, ${errorCount} errors.`
        });

        response.json(res);
    });
}

module.exports = new UserController();