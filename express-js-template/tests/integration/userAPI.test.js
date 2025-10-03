/**
 * Integration Tests for User API
 * 
 * Tests for user API endpoints including authentication, validation, and error handling
 */

const request = require('supertest');
const TestUtils = require('../utils/testUtils');
const DatabaseTestHelper = require('../utils/databaseHelper');

describe('User API Integration Tests', () => {
    let app;
    let dbHelper;

    beforeAll(async () => {
        app = TestUtils.createTestApp();
        dbHelper = new DatabaseTestHelper();
        await dbHelper.setup();
    });

    beforeEach(async () => {
        await dbHelper.clean();
    });

    afterAll(async () => {
        await dbHelper.restore();
    });

    describe('POST /api/users/register', () => {
        test('should register a new user successfully', async () => {
            const userData = TestUtils.createUserData();

            const response = await request(app)
                .post('/api/users/register')
                .send(userData);

            TestUtils.expectSuccessResponse(response, 201);
            expect(response.body.meta.user.email).toBe(userData.email);
            expect(response.body.meta.user).not.toHaveProperty('password');
            expect(response.body.meta.tokens).toHaveProperty('accessToken');
            expect(response.body.meta.tokens).toHaveProperty('refreshToken');
        });

        test('should return validation error for invalid data', async () => {
            const invalidData = {
                firstName: 'A', // Too short
                email: 'invalid-email', // Invalid format
                password: '123', // Too weak
                terms: false // Not accepted
            };

            const response = await request(app)
                .post('/api/users/register')
                .send(invalidData);

            TestUtils.expectValidationError(response);
        });

        test('should return error for duplicate email', async () => {
            const userData = TestUtils.createUserData();

            // Register first user
            await request(app)
                .post('/api/users/register')
                .send(userData);

            // Try to register with same email
            const response = await request(app)
                .post('/api/users/register')
                .send(userData);

            TestUtils.expectErrorResponse(response, 409);
            expect(response.body.message).toBe('Email already registered');
        });

        test('should apply rate limiting', async () => {
            const userData = TestUtils.createUserData();

            // Make multiple rapid requests (exceeding auth rate limit)
            const promises = Array.from({ length: 10 }, () =>
                request(app)
                    .post('/api/users/register')
                    .send({ ...userData, email: TestUtils.randomData.email() })
            );

            const responses = await Promise.all(promises);

            // At least one should be rate limited
            const rateLimitedResponses = responses.filter(res => res.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });
    });

    describe('POST /api/users/login', () => {
        test('should login user successfully', async () => {
            const userData = TestUtils.createUserData();

            // Register user first
            await request(app)
                .post('/api/users/register')
                .send(userData);

            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });

            TestUtils.expectSuccessResponse(response);
            expect(response.body.meta.user.email).toBe(userData.email);
            expect(response.body.meta.tokens).toHaveProperty('accessToken');
        });

        test('should return error for invalid credentials', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'wrongpassword'
                });

            TestUtils.expectUnauthorizedError(response);
            expect(response.body.message).toBe('Invalid email or password');
        });

        test('should return validation error for missing data', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'invalid-email' // Missing password, invalid email
                });

            TestUtils.expectValidationError(response);
        });
    });

    describe('GET /api/users/profile', () => {
        test('should get user profile successfully', async () => {
            const userData = TestUtils.createUserData();
            const registerResponse = await request(app)
                .post('/api/users/register')
                .send(userData);

            const token = registerResponse.body.meta.tokens.accessToken;

            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${token}`);

            TestUtils.expectSuccessResponse(response);
            expect(response.body.meta.user.email).toBe(userData.email);
            expect(response.body.meta.user).not.toHaveProperty('password');
        });

        test('should return unauthorized error without token', async () => {
            const response = await request(app)
                .get('/api/users/profile');

            TestUtils.expectUnauthorizedError(response);
        });

        test('should return unauthorized error with invalid token', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', 'Bearer invalid-token');

            TestUtils.expectUnauthorizedError(response);
        });
    });

    describe('PUT /api/users/profile', () => {
        test('should update profile successfully', async () => {
            const userData = TestUtils.createUserData();
            const registerResponse = await request(app)
                .post('/api/users/register')
                .send(userData);

            const token = registerResponse.body.meta.tokens.accessToken;

            const updateData = {
                firstName: 'UpdatedFirst',
                lastName: 'UpdatedLast',
                phone: '+9876543210'
            };

            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            TestUtils.expectSuccessResponse(response);
            expect(response.body.meta.user.firstName).toBe(updateData.firstName);
            expect(response.body.meta.user.lastName).toBe(updateData.lastName);
            expect(response.body.meta.user.phone).toBe(updateData.phone);
        });

        test('should return validation error for invalid update data', async () => {
            const userData = TestUtils.createUserData();
            const registerResponse = await request(app)
                .post('/api/users/register')
                .send(userData);

            const token = registerResponse.body.meta.tokens.accessToken;

            const invalidUpdateData = {
                firstName: 'A', // Too short
                email: 'invalid-email', // Invalid format
                phone: 'invalid-phone' // Invalid format
            };

            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidUpdateData);

            TestUtils.expectValidationError(response);
        });
    });

    describe('PUT /api/users/change-password', () => {
        test('should change password successfully', async () => {
            const userData = TestUtils.createUserData();
            const registerResponse = await request(app)
                .post('/api/users/register')
                .send(userData);

            const token = registerResponse.body.meta.tokens.accessToken;

            const passwordData = {
                currentPassword: userData.password,
                password: 'NewSecurePass123!',
                confirmPassword: 'NewSecurePass123!'
            };

            const response = await request(app)
                .put('/api/users/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send(passwordData);

            TestUtils.expectSuccessResponse(response);
            expect(response.body.meta.message).toBe('Password updated successfully');
        });

        test('should return error for incorrect current password', async () => {
            const userData = TestUtils.createUserData();
            const registerResponse = await request(app)
                .post('/api/users/register')
                .send(userData);

            const token = registerResponse.body.meta.tokens.accessToken;

            const passwordData = {
                currentPassword: 'wrongpassword',
                password: 'NewSecurePass123!',
                confirmPassword: 'NewSecurePass123!'
            };

            const response = await request(app)
                .put('/api/users/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send(passwordData);

            TestUtils.expectErrorResponse(response, 400);
            expect(response.body.message).toBe('Current password is incorrect');
        });
    });

    describe('DELETE /api/users/account', () => {
        test('should delete account successfully', async () => {
            const userData = TestUtils.createUserData();
            const registerResponse = await request(app)
                .post('/api/users/register')
                .send(userData);

            const token = registerResponse.body.meta.tokens.accessToken;

            const response = await request(app)
                .delete('/api/users/account')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: userData.password,
                    confirmation: 'DELETE'
                });

            TestUtils.expectSuccessResponse(response);
            expect(response.body.meta.message).toBe('Account deleted successfully');
        });

        test('should return validation error for missing confirmation', async () => {
            const userData = TestUtils.createUserData();
            const registerResponse = await request(app)
                .post('/api/users/register')
                .send(userData);

            const token = registerResponse.body.meta.tokens.accessToken;

            const response = await request(app)
                .delete('/api/users/account')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: userData.password,
                    confirmation: 'WRONG' // Should be 'DELETE'
                });

            TestUtils.expectValidationError(response);
        });
    });

    describe('GET /api/users/search', () => {
        test('should search users successfully', async () => {
            // Seed test data
            await dbHelper.seedFull();

            const response = await request(app)
                .get('/api/users/search')
                .query({
                    search: 'user',
                    page: 1,
                    limit: 10
                });

            TestUtils.expectSuccessResponse(response);
            expect(response.body.meta.users).toBeInstanceOf(Array);
            expect(response.body.meta.pagination).toHaveProperty('page');
            expect(response.body.meta.pagination).toHaveProperty('limit');
        });

        test('should return validation error for missing search query', async () => {
            const response = await request(app)
                .get('/api/users/search');

            TestUtils.expectValidationError(response);
        });

        test('should return validation error for invalid pagination params', async () => {
            const response = await request(app)
                .get('/api/users/search')
                .query({
                    search: 'user',
                    page: 0, // Invalid page
                    limit: 101 // Exceeds max limit
                });

            TestUtils.expectValidationError(response);
        });
    });

    describe('Admin Endpoints', () => {
        let adminToken;
        let userToken;
        let testUser;

        beforeEach(async () => {
            // Create admin user
            const adminData = TestUtils.createUserData({ email: 'admin@example.com' });
            const adminResponse = await request(app)
                .post('/api/users/register')
                .send(adminData);

            // Update to admin role
            const adminUserId = adminResponse.body.meta.user.id;
            await dbHelper.updateUser(adminUserId, { role: 'admin' });

            adminToken = TestUtils.generateAdminToken({ user_id: adminUserId });

            // Create regular user
            const userData = TestUtils.createUserData();
            const userResponse = await request(app)
                .post('/api/users/register')
                .send(userData);

            userToken = userResponse.body.meta.tokens.accessToken;
            testUser = userResponse.body.meta.user;
        });

        describe('GET /api/users', () => {
            test('should get all users for admin', async () => {
                const response = await request(app)
                    .get('/api/users')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .query({
                        page: 1,
                        limit: 10
                    });

                TestUtils.expectSuccessResponse(response);
                expect(response.body.meta.users).toBeInstanceOf(Array);
                expect(response.body.meta.pagination).toHaveProperty('page');
            });

            test('should return forbidden error for regular user', async () => {
                const response = await request(app)
                    .get('/api/users')
                    .set('Authorization', `Bearer ${userToken}`);

                TestUtils.expectForbiddenError(response);
            });
        });

        describe('GET /api/users/:id', () => {
            test('should get user by ID for admin', async () => {
                const response = await request(app)
                    .get(`/api/users/${testUser.id}`)
                    .set('Authorization', `Bearer ${adminToken}`);

                TestUtils.expectSuccessResponse(response);
                expect(response.body.meta.user.id).toBe(testUser.id);
            });

            test('should return validation error for invalid ID', async () => {
                const response = await request(app)
                    .get('/api/users/invalid-id')
                    .set('Authorization', `Bearer ${adminToken}`);

                TestUtils.expectValidationError(response);
            });
        });

        describe('PUT /api/users/:id', () => {
            test('should update user for admin', async () => {
                const updateData = {
                    firstName: 'AdminUpdated',
                    status: 'inactive'
                };

                const response = await request(app)
                    .put(`/api/users/${testUser.id}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(updateData);

                TestUtils.expectSuccessResponse(response);
                expect(response.body.meta.user.firstName).toBe(updateData.firstName);
                expect(response.body.meta.user.status).toBe(updateData.status);
            });

            test('should return validation error for invalid update data', async () => {
                const invalidData = {
                    role: 'invalid-role',
                    status: 'invalid-status'
                };

                const response = await request(app)
                    .put(`/api/users/${testUser.id}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(invalidData);

                TestUtils.expectValidationError(response);
            });
        });

        describe('DELETE /api/users/:id', () => {
            test('should delete user for admin', async () => {
                const response = await request(app)
                    .delete(`/api/users/${testUser.id}`)
                    .set('Authorization', `Bearer ${adminToken}`);

                TestUtils.expectSuccessResponse(response);
                expect(response.body.meta.message).toBe('User deleted successfully');
            });

            test('should return error when admin tries to delete themselves', async () => {
                const adminData = TestUtils.createUserData({ email: 'admin2@example.com' });
                const adminResponse = await request(app)
                    .post('/api/users/register')
                    .send(adminData);

                const adminId = adminResponse.body.meta.user.id;
                await dbHelper.updateUser(adminId, { role: 'admin' });
                const selfAdminToken = TestUtils.generateAdminToken({ user_id: adminId });

                const response = await request(app)
                    .delete(`/api/users/${adminId}`)
                    .set('Authorization', `Bearer ${selfAdminToken}`);

                TestUtils.expectErrorResponse(response, 400);
                expect(response.body.message).toBe('Cannot delete your own account');
            });
        });

        describe('POST /api/users/:id/ban', () => {
            test('should ban user for admin', async () => {
                const banData = {
                    reason: 'Violation of terms of service',
                    duration: 30
                };

                const response = await request(app)
                    .post(`/api/users/${testUser.id}/ban`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(banData);

                TestUtils.expectSuccessResponse(response);
                expect(response.body.meta.message).toBe('User banned successfully');
                expect(response.body.meta.user.status).toBe('banned');
            });

            test('should return validation error for missing ban reason', async () => {
                const invalidBanData = {
                    reason: 'Too short' // Less than 10 characters
                };

                const response = await request(app)
                    .post(`/api/users/${testUser.id}/ban`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(invalidBanData);

                TestUtils.expectValidationError(response);
            });
        });

        describe('POST /api/users/bulk-delete', () => {
            test('should bulk delete users for admin', async () => {
                // Create additional test users
                const user1 = await dbHelper.createTestUser();
                const user2 = await dbHelper.createTestUser();

                const bulkData = {
                    userIds: [user1.id, user2.id]
                };

                const response = await request(app)
                    .post('/api/users/bulk-delete')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(bulkData);

                TestUtils.expectSuccessResponse(response);
                expect(response.body.meta.summary.success).toBe(2);
                expect(response.body.meta.summary.errors).toBe(0);
            });

            test('should return validation error for invalid user IDs array', async () => {
                const invalidData = {
                    userIds: 'not-an-array'
                };

                const response = await request(app)
                    .post('/api/users/bulk-delete')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(invalidData);

                TestUtils.expectValidationError(response);
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle 404 for non-existent routes', async () => {
            const response = await request(app)
                .get('/api/users/non-existent-endpoint');

            TestUtils.expectNotFoundError(response);
        });

        test('should sanitize XSS attempts', async () => {
            const maliciousData = TestUtils.createUserData({
                firstName: '<script>alert("xss")</script>',
                lastName: '<img src=x onerror=alert("xss")>'
            });

            const response = await request(app)
                .post('/api/users/register')
                .send(maliciousData);

            if (response.status === 201) {
                // If registration succeeds, check that XSS is sanitized
                expect(response.body.meta.user.firstName).not.toContain('<script>');
                expect(response.body.meta.user.lastName).not.toContain('<img');
            }
        });

        test('should handle large request payload', async () => {
            const largeData = TestUtils.createUserData({
                bio: 'x'.repeat(10000) // Very long bio
            });

            const userData = TestUtils.createUserData();
            const registerResponse = await request(app)
                .post('/api/users/register')
                .send(userData);

            const token = registerResponse.body.meta.tokens.accessToken;

            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${token}`)
                .send(largeData);

            // Should either succeed with truncated data or return validation error
            expect([200, 400].includes(response.status)).toBe(true);
        });
    });

    describe('Performance Tests', () => {
        test('should handle concurrent user registrations', async () => {
            const concurrentRequests = 5;
            const promises = Array.from({ length: concurrentRequests }, (_, index) =>
                request(app)
                    .post('/api/users/register')
                    .send(TestUtils.createUserData({ email: `concurrent${index}@example.com` }))
            );

            const responses = await Promise.all(promises);

            const successfulResponses = responses.filter(res => res.status === 201);
            expect(successfulResponses.length).toBe(concurrentRequests);
        });

        test('should respond within acceptable time limits', async () => {
            const userData = TestUtils.createUserData();

            const start = Date.now();
            const response = await request(app)
                .post('/api/users/register')
                .send(userData);
            const duration = Date.now() - start;

            TestUtils.expectSuccessResponse(response, 201);
            expect(duration).toBeLessThan(5000); // Should respond within 5 seconds
        });
    });
});