/**
 * User Model/Schema Definition
 * 
 * This is a template model for User entity.
 * You can adapt this to work with your chosen database (MongoDB, PostgreSQL, MySQL, etc.)
 * This example shows the structure and validation rules.
 */

class User {
    constructor(data) {
        this.id = data.id || null;
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.email = data.email || '';
        this.password = data.password || '';
        this.phone = data.phone || null;
        this.dateOfBirth = data.dateOfBirth || null;
        this.gender = data.gender || null;
        this.bio = data.bio || null;
        this.avatar = data.avatar || null;
        this.role = data.role || 'user';
        this.status = data.status || 'active';
        this.emailVerified = data.emailVerified || false;
        this.emailVerifiedAt = data.emailVerifiedAt || null;
        this.lastLoginAt = data.lastLoginAt || null;
        this.preferences = data.preferences || {};
        this.metadata = data.metadata || {};
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        this.deletedAt = data.deletedAt || null;
    }

    /**
     * Get user's full name
     */
    get fullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    /**
     * Check if user is active
     */
    get isActive() {
        return this.status === 'active' && !this.deletedAt;
    }

    /**
     * Check if user is admin
     */
    get isAdmin() {
        return this.role === 'admin';
    }

    /**
     * Check if email is verified
     */
    get isEmailVerified() {
        return this.emailVerified && this.emailVerifiedAt;
    }

    /**
     * Get safe user data (without sensitive fields)
     */
    toSafeObject() {
        const safeData = { ...this };
        delete safeData.password;
        delete safeData.metadata;
        return safeData;
    }

    /**
     * Get public user data (minimal info for public display)
     */
    toPublicObject() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            fullName: this.fullName,
            avatar: this.avatar,
            bio: this.bio,
            createdAt: this.createdAt
        };
    }

    /**
     * Update user data
     */
    update(data) {
        const allowedFields = [
            'firstName', 'lastName', 'phone', 'dateOfBirth',
            'gender', 'bio', 'avatar', 'preferences'
        ];

        allowedFields.forEach(field => {
            if (data.hasOwnProperty(field)) {
                this[field] = data[field];
            }
        });

        this.updatedAt = new Date();
        return this;
    }

    /**
     * Mark user as deleted (soft delete)
     */
    softDelete() {
        this.deletedAt = new Date();
        this.status = 'deleted';
        this.updatedAt = new Date();
        return this;
    }

    /**
     * Restore soft deleted user
     */
    restore() {
        this.deletedAt = null;
        this.status = 'active';
        this.updatedAt = new Date();
        return this;
    }

    /**
     * Verify user email
     */
    verifyEmail() {
        this.emailVerified = true;
        this.emailVerifiedAt = new Date();
        this.updatedAt = new Date();
        return this;
    }

    /**
     * Update last login time
     */
    updateLastLogin() {
        this.lastLoginAt = new Date();
        this.updatedAt = new Date();
        return this;
    }

    /**
     * Change user role
     */
    changeRole(newRole) {
        const allowedRoles = ['user', 'admin', 'moderator'];
        if (!allowedRoles.includes(newRole)) {
            throw new Error('Invalid role');
        }
        this.role = newRole;
        this.updatedAt = new Date();
        return this;
    }

    /**
     * Change user status
     */
    changeStatus(newStatus) {
        const allowedStatuses = ['active', 'inactive', 'banned', 'pending'];
        if (!allowedStatuses.includes(newStatus)) {
            throw new Error('Invalid status');
        }
        this.status = newStatus;
        this.updatedAt = new Date();
        return this;
    }

    /**
     * Validate user data
     */
    validate() {
        const errors = [];

        if (!this.firstName || this.firstName.length < 2) {
            errors.push('First name must be at least 2 characters');
        }

        if (!this.lastName || this.lastName.length < 2) {
            errors.push('Last name must be at least 2 characters');
        }

        if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
            errors.push('Valid email is required');
        }

        if (!this.password || this.password.length < 8) {
            errors.push('Password must be at least 8 characters');
        }

        if (this.phone && !/^\+?[\d\s-()]+$/.test(this.phone)) {
            errors.push('Invalid phone number format');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

/**
 * User Repository (Database operations)
 * This is a mock implementation. Replace with actual database operations.
 */
class UserRepository {
    constructor() {
        // Mock database - replace with actual database connection
        this.users = new Map();
        this.nextId = 1;
    }

    /**
     * Create a new user
     */
    async create(userData) {
        const user = new User({
            ...userData,
            id: this.nextId++,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const validation = user.validate();
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        this.users.set(user.id, user);
        return user;
    }

    /**
     * Find user by ID
     */
    async findById(id) {
        return this.users.get(parseInt(id)) || null;
    }

    /**
     * Find user by email
     */
    async findByEmail(email) {
        for (const user of this.users.values()) {
            if (user.email === email && !user.deletedAt) {
                return user;
            }
        }
        return null;
    }

    /**
     * Find all users with pagination and filters
     */
    async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            search = '',
            role = null,
            status = null,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = options;

        let users = Array.from(this.users.values())
            .filter(user => !user.deletedAt);

        // Apply filters
        if (search) {
            const searchLower = search.toLowerCase();
            users = users.filter(user =>
                user.firstName.toLowerCase().includes(searchLower) ||
                user.lastName.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower)
            );
        }

        if (role) {
            users = users.filter(user => user.role === role);
        }

        if (status) {
            users = users.filter(user => user.status === status);
        }

        // Apply sorting
        users.sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        // Apply pagination
        const total = users.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedUsers = users.slice(offset, offset + limit);

        return {
            users: paginatedUsers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    }

    /**
     * Update user
     */
    async update(id, updateData) {
        const user = await this.findById(id);
        if (!user) {
            return null;
        }

        user.update(updateData);
        this.users.set(user.id, user);
        return user;
    }

    /**
     * Delete user (soft delete)
     */
    async delete(id) {
        const user = await this.findById(id);
        if (!user) {
            return null;
        }

        user.softDelete();
        this.users.set(user.id, user);
        return user;
    }

    /**
     * Hard delete user (permanent)
     */
    async hardDelete(id) {
        const user = await this.findById(id);
        if (!user) {
            return false;
        }

        this.users.delete(user.id);
        return true;
    }

    /**
     * Check if email exists
     */
    async emailExists(email, excludeId = null) {
        for (const user of this.users.values()) {
            if (user.email === email && user.id !== excludeId && !user.deletedAt) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get user count
     */
    async count(filters = {}) {
        let users = Array.from(this.users.values())
            .filter(user => !user.deletedAt);

        if (filters.role) {
            users = users.filter(user => user.role === filters.role);
        }

        if (filters.status) {
            users = users.filter(user => user.status === filters.status);
        }

        return users.length;
    }
}

// Export singleton instance
const userRepository = new UserRepository();

module.exports = {
    User,
    UserRepository,
    userRepository
};