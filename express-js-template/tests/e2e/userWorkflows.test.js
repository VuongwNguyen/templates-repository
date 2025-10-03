/**
 * End-to-End Tests for User Workflows
 * 
 * Tests complete user journeys and workflows from registration to deletion
 */

const request = require('supertest');
const TestUtils = require('../utils/testUtils');
const DatabaseTestHelper = require('../utils/databaseHelper');

describe('User E2E Workflows', () => {
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

    describe('Complete User Registration to Profile Management Flow', () => {
        test('should complete full user lifecycle workflow', async () => {
            // Step 1: User Registration
            const userData = TestUtils.createUserData();

            const registerResponse = await request(app)
                .post('/api/users/register')
                .send(userData);

            TestUtils.expectSuccessResponse(registerResponse, 201);
            expect(registerResponse.body.meta.user.email).toBe(userData.email);
            expect(registerResponse.body.meta.tokens).toHaveProperty('accessToken');

            const { accessToken } = registerResponse.body.meta.tokens;
            const userId = registerResponse.body.meta.user.id;

            // Step 2: Login (verify authentication works)
            const loginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });

            TestUtils.expectSuccessResponse(loginResponse);
            expect(loginResponse.body.meta.user.id).toBe(userId);

            // Step 3: Access Protected Profile
            const profileResponse = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${accessToken}`);

            TestUtils.expectSuccessResponse(profileResponse);
            expect(profileResponse.body.meta.user.id).toBe(userId);
            expect(profileResponse.body.meta.user).not.toHaveProperty('password');

            // Step 4: Update Profile Information
            const updateData = {
                firstName: 'UpdatedFirst',
                lastName: 'UpdatedLast',
                phone: '+1234567890',
                bio: 'Updated bio for testing'
            };

            const updateResponse = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(updateData);

            TestUtils.expectSuccessResponse(updateResponse);
            expect(updateResponse.body.meta.user.firstName).toBe(updateData.firstName);
            expect(updateResponse.body.meta.user.bio).toBe(updateData.bio);

            // Step 5: Change Password
            const newPassword = 'NewSecurePassword123!';
            const passwordResponse = await request(app)
                .put('/api/users/change-password')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    currentPassword: userData.password,
                    password: newPassword,
                    confirmPassword: newPassword
                });

            TestUtils.expectSuccessResponse(passwordResponse);

            // Step 6: Verify new password works with login
            const newLoginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    email: userData.email,
                    password: newPassword
                });

            TestUtils.expectSuccessResponse(newLoginResponse);

            // Step 7: Verify old password doesn't work
            const oldPasswordResponse = await request(app)
                .post('/api/users/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });

            TestUtils.expectUnauthorizedError(oldPasswordResponse);

            // Step 8: Delete Account
            const deleteResponse = await request(app)
                .delete('/api/users/account')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    password: newPassword,
                    confirmation: 'DELETE'
                });

            TestUtils.expectSuccessResponse(deleteResponse);

            // Step 9: Verify account is deleted (login should fail)
            const finalLoginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    email: userData.email,
                    password: newPassword
                });

            TestUtils.expectUnauthorizedError(finalLoginResponse);
        });
    });

    describe('Admin User Management Workflow', () => {
        test('should complete admin user management workflow', async () => {
            // Step 1: Create Admin User
            const adminData = TestUtils.createUserData({ email: 'admin@example.com' });
            const adminRegisterResponse = await request(app)
                .post('/api/users/register')
                .send(adminData);

            const adminUserId = adminRegisterResponse.body.meta.user.id;
            await dbHelper.updateUser(adminUserId, { role: 'admin' });
            const adminToken = TestUtils.generateAdminToken({ user_id: adminUserId });

            // Step 2: Create Multiple Test Users
            const testUsers = [];
            for (let i = 0; i < 3; i++) {
                const userData = TestUtils.createUserData({
                    email: `testuser${i}@example.com`
                });

                const userResponse = await request(app)
                    .post('/api/users/register')
                    .send(userData);

                testUsers.push({
                    ...userResponse.body.meta.user,
                    password: userData.password
                });
            }

            // Step 3: Admin Views All Users
            const usersListResponse = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .query({ page: 1, limit: 10 });

            TestUtils.expectSuccessResponse(usersListResponse);
            expect(usersListResponse.body.meta.users.length).toBeGreaterThanOrEqual(4); // Admin + 3 users

            // Step 4: Admin Views Specific User
            const userDetailResponse = await request(app)
                .get(`/api/users/${testUsers[0].id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            TestUtils.expectSuccessResponse(userDetailResponse);
            expect(userDetailResponse.body.meta.user.id).toBe(testUsers[0].id);

            // Step 5: Admin Updates User Information
            const adminUpdateData = {
                firstName: 'AdminUpdated',
                status: 'inactive',
                role: 'moderator'
            };

            const adminUpdateResponse = await request(app)
                .put(`/api/users/${testUsers[0].id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(adminUpdateData);

            TestUtils.expectSuccessResponse(adminUpdateResponse);
            expect(adminUpdateResponse.body.meta.user.firstName).toBe(adminUpdateData.firstName);
            expect(adminUpdateResponse.body.meta.user.status).toBe(adminUpdateData.status);

            // Step 6: Admin Bans User
            const banData = {
                reason: 'Violation of community guidelines - inappropriate behavior',
                duration: 30
            };

            const banResponse = await request(app)
                .post(`/api/users/${testUsers[1].id}/ban`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(banData);

            TestUtils.expectSuccessResponse(banResponse);
            expect(banResponse.body.meta.user.status).toBe('banned');

            // Step 7: Verify banned user cannot login
            const bannedLoginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    email: testUsers[1].email,
                    password: testUsers[1].password
                });

            TestUtils.expectErrorResponse(bannedLoginResponse, 403);

            // Step 8: Admin Unbans User
            const unbanResponse = await request(app)
                .post(`/api/users/${testUsers[1].id}/unban`)
                .set('Authorization', `Bearer ${adminToken}`);

            TestUtils.expectSuccessResponse(unbanResponse);
            expect(unbanResponse.body.meta.user.status).toBe('active');

            // Step 9: Verify unbanned user can login again
            const unbanLoginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    email: testUsers[1].email,
                    password: testUsers[1].password
                });

            TestUtils.expectSuccessResponse(unbanLoginResponse);

            // Step 10: Admin Bulk Delete Users
            const bulkDeleteResponse = await request(app)
                .post('/api/users/bulk-delete')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    userIds: [testUsers[1].id, testUsers[2].id]
                });

            TestUtils.expectSuccessResponse(bulkDeleteResponse);
            expect(bulkDeleteResponse.body.meta.summary.success).toBe(2);

            // Step 11: Verify deleted users cannot login
            const deletedLoginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    email: testUsers[1].email,
                    password: testUsers[1].password
                });

            TestUtils.expectUnauthorizedError(deletedLoginResponse);
        });
    });

    describe('User Search and Discovery Workflow', () => {
        test('should complete user search workflow', async () => {
            // Step 1: Seed database with test users
            await dbHelper.seedFull();

            // Step 2: Search for users with common term
            const searchResponse = await request(app)
                .get('/api/users/search')
                .query({
                    search: 'user',
                    page: 1,
                    limit: 5
                });

            TestUtils.expectSuccessResponse(searchResponse);
            expect(searchResponse.body.meta.users).toBeInstanceOf(Array);
            expect(searchResponse.body.meta.pagination).toHaveProperty('total');

            // Step 3: Search with specific criteria
            const specificSearchResponse = await request(app)
                .get('/api/users/search')
                .query({
                    search: 'test',
                    status: 'active',
                    role: 'user',
                    page: 1,
                    limit: 10
                });

            TestUtils.expectSuccessResponse(specificSearchResponse);

            // Step 4: Test pagination
            if (specificSearchResponse.body.meta.pagination.total > 5) {
                const paginatedResponse = await request(app)
                    .get('/api/users/search')
                    .query({
                        search: 'test',
                        page: 2,
                        limit: 5
                    });

                TestUtils.expectSuccessResponse(paginatedResponse);
                expect(paginatedResponse.body.meta.pagination.page).toBe(2);
            }

            // Step 5: Search with no results
            const noResultsResponse = await request(app)
                .get('/api/users/search')
                .query({
                    search: 'nonexistentusername12345',
                    page: 1,
                    limit: 10
                });

            TestUtils.expectSuccessResponse(noResultsResponse);
            expect(noResultsResponse.body.meta.users).toHaveLength(0);
        });
    });

    describe('Security and Error Handling Workflow', () => {
        test('should handle security scenarios properly', async () => {
            // Step 1: Test rate limiting on registration
            const userData = TestUtils.createUserData();
            const rapidRequests = [];

            for (let i = 0; i < 8; i++) {
                rapidRequests.push(
                    request(app)
                        .post('/api/users/register')
                        .send({
                            ...userData,
                            email: `rapid${i}@example.com`
                        })
                );
            }

            const rapidResponses = await Promise.all(rapidRequests);
            const rateLimitedCount = rapidResponses.filter(res => res.status === 429).length;
            expect(rateLimitedCount).toBeGreaterThan(0);

            // Step 2: Test XSS protection
            const xssData = TestUtils.createUserData({
                firstName: '<script>alert("xss")</script>',
                lastName: '<img src=x onerror=alert("xss")>',
                bio: 'Normal bio with <script>malicious()</script> content'
            });

            const xssResponse = await request(app)
                .post('/api/users/register')
                .send(xssData);

            if (xssResponse.status === 201) {
                expect(xssResponse.body.meta.user.firstName).not.toContain('<script>');
                expect(xssResponse.body.meta.user.lastName).not.toContain('<img');
            }

            // Step 3: Test SQL injection protection
            const sqlInjectionData = TestUtils.createUserData({
                email: "test'; DROP TABLE users; --@example.com"
            });

            const sqlResponse = await request(app)
                .post('/api/users/register')
                .send(sqlInjectionData);

            // Should either be sanitized or validation error
            expect([201, 400].includes(sqlResponse.status)).toBe(true);

            // Step 4: Test unauthorized access attempts
            const userData2 = TestUtils.createUserData();
            const registerResponse = await request(app)
                .post('/api/users/register')
                .send(userData2);

            const userToken = registerResponse.body.meta.tokens.accessToken;

            // Try to access admin endpoint
            const unauthorizedResponse = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${userToken}`);

            TestUtils.expectForbiddenError(unauthorizedResponse);

            // Step 5: Test token manipulation
            const manipulatedToken = userToken.slice(0, -5) + 'FAKE';
            const manipulatedResponse = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${manipulatedToken}`);

            TestUtils.expectUnauthorizedError(manipulatedResponse);
        });
    });

    describe('Performance and Load Testing Workflow', () => {
        test('should handle concurrent operations efficiently', async () => {
            // Step 1: Concurrent user registrations
            const concurrentRegistrations = Array.from({ length: 10 }, (_, index) =>
                request(app)
                    .post('/api/users/register')
                    .send(TestUtils.createUserData({
                        email: `concurrent${index}@example.com`
                    }))
            );

            const startTime = Date.now();
            const registrationResults = await Promise.all(concurrentRegistrations);
            const registrationTime = Date.now() - startTime;

            const successfulRegistrations = registrationResults.filter(res => res.status === 201);
            expect(successfulRegistrations.length).toBe(10);
            expect(registrationTime).toBeLessThan(10000); // Should complete within 10 seconds

            // Step 2: Concurrent profile updates
            const updatePromises = successfulRegistrations.map(async (regResponse, index) => {
                const token = regResponse.body.meta.tokens.accessToken;
                return request(app)
                    .put('/api/users/profile')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        firstName: `Updated${index}`,
                        bio: `Concurrent update test ${index}`
                    });
            });

            const updateStartTime = Date.now();
            const updateResults = await Promise.all(updatePromises);
            const updateTime = Date.now() - updateStartTime;

            const successfulUpdates = updateResults.filter(res => res.status === 200);
            expect(successfulUpdates.length).toBe(10);
            expect(updateTime).toBeLessThan(8000); // Should complete within 8 seconds

            // Step 3: Stress test search endpoint
            await dbHelper.seedFull(); // Add more test data

            const searchPromises = Array.from({ length: 20 }, (_, index) =>
                request(app)
                    .get('/api/users/search')
                    .query({
                        search: index % 2 === 0 ? 'user' : 'test',
                        page: Math.floor(index / 5) + 1,
                        limit: 5
                    })
            );

            const searchStartTime = Date.now();
            const searchResults = await Promise.all(searchPromises);
            const searchTime = Date.now() - searchStartTime;

            const successfulSearches = searchResults.filter(res => res.status === 200);
            expect(successfulSearches.length).toBe(20);
            expect(searchTime).toBeLessThan(15000); // Should complete within 15 seconds
        });
    });

    describe('Data Integrity Workflow', () => {
        test('should maintain data consistency across operations', async () => {
            // Step 1: Create user and verify initial state
            const userData = TestUtils.createUserData();
            const registerResponse = await request(app)
                .post('/api/users/register')
                .send(userData);

            const userId = registerResponse.body.meta.user.id;
            const token = registerResponse.body.meta.tokens.accessToken;

            // Step 2: Multiple profile updates
            const updates = [
                { firstName: 'First', lastName: 'Update' },
                { phone: '+1234567890', bio: 'First bio update' },
                { firstName: 'Second', bio: 'Second bio update' }
            ];

            for (const updateData of updates) {
                const updateResponse = await request(app)
                    .put('/api/users/profile')
                    .set('Authorization', `Bearer ${token}`)
                    .send(updateData);

                TestUtils.expectSuccessResponse(updateResponse);
            }

            // Step 3: Verify final state
            const finalProfileResponse = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${token}`);

            TestUtils.expectSuccessResponse(finalProfileResponse);
            const finalUser = finalProfileResponse.body.meta.user;

            expect(finalUser.firstName).toBe('Second'); // Last firstName update
            expect(finalUser.lastName).toBe('Update'); // From first update
            expect(finalUser.phone).toBe('+1234567890'); // From second update
            expect(finalUser.bio).toBe('Second bio update'); // Last bio update
            expect(finalUser.email).toBe(userData.email); // Should remain unchanged

            // Step 4: Password change and verification
            const newPassword = 'NewPassword123!';
            await request(app)
                .put('/api/users/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: userData.password,
                    password: newPassword,
                    confirmPassword: newPassword
                });

            // Step 5: Verify new password works and old doesn't
            const newLoginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    email: userData.email,
                    password: newPassword
                });

            const oldLoginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });

            TestUtils.expectSuccessResponse(newLoginResponse);
            TestUtils.expectUnauthorizedError(oldLoginResponse);
        });
    });
});