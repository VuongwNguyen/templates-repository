/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get user by ID
 *     description: |
 *       Retrieves detailed information for a specific user by their ID.
 *       Only accessible by administrators.
 *       
 *       **Authentication Required**: Bearer token with admin role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   put:
 *     tags: [Admin]
 *     summary: Update user by ID
 *     description: |
 *       Updates user information including role and status.
 *       Only accessible by administrators.
 *       
 *       **Authentication Required**: Bearer token with admin role
 *       **Rate Limiting**: 100 requests per 15 minutes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, moderator, admin]
 *               status:
 *                 type: string
 *                 enum: [active, inactive, banned, pending]
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *           examples:
 *             roleUpdate:
 *               summary: Update user role
 *               value:
 *                 role: "moderator"
 *                 status: "active"
 *             fullUpdate:
 *               summary: Full user update
 *               value:
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@example.com"
 *                 phone: "+1234567890"
 *                 role: "moderator"
 *                 status: "active"
 *                 bio: "Updated by admin"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     tags: [Admin]
 *     summary: Delete user by ID
 *     description: |
 *       Permanently deletes a user account. Administrators cannot delete their own account.
 *       Only accessible by administrators.
 *       
 *       **Authentication Required**: Bearer token with admin role
 *       **Rate Limiting**: 3 requests per 15 minutes (sensitive operation)
 *       
 *       **Restrictions**:
 *       - Cannot delete own account
 *       - Cannot delete other admin accounts (depending on configuration)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               success:
 *                 summary: User deleted successfully
 *                 value:
 *                   success: true
 *                   message: "User deleted successfully"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Cannot delete own account or other admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               selfDeletion:
 *                 summary: Cannot delete own account
 *                 value:
 *                   success: false
 *                   message: "Cannot delete your own account"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/users/{id}/ban:
 *   post:
 *     tags: [Admin]
 *     summary: Ban user account
 *     description: |
 *       Bans a user account with a specific reason and optional duration.
 *       Banned users cannot log in or perform actions.
 *       
 *       **Authentication Required**: Bearer token with admin role
 *       **Rate Limiting**: 3 requests per 15 minutes (sensitive operation)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserBan'
 *           examples:
 *             temporaryBan:
 *               summary: 30-day ban
 *               value:
 *                 reason: "Violation of community guidelines - inappropriate behavior"
 *                 duration: 30
 *             permanentBan:
 *               summary: Permanent ban
 *               value:
 *                 reason: "Severe policy violation - spam and harassment"
 *     responses:
 *       200:
 *         description: User banned successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         banDetails:
 *                           type: object
 *                           properties:
 *                             reason:
 *                               type: string
 *                             duration:
 *                               type: integer
 *                             bannedAt:
 *                               type: string
 *                               format: date-time
 *                             bannedUntil:
 *                               type: string
 *                               format: date-time
 *             examples:
 *               success:
 *                 summary: User banned successfully
 *                 value:
 *                   success: true
 *                   message: "User banned successfully"
 *                   meta:
 *                     user:
 *                       id: "user_123"
 *                       email: "banned.user@example.com"
 *                       status: "banned"
 *                     banDetails:
 *                       reason: "Violation of community guidelines"
 *                       duration: 30
 *                       bannedAt: "2024-01-15T10:30:00.000Z"
 *                       bannedUntil: "2024-02-14T10:30:00.000Z"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'

/**
 * @swagger
 * /api/users/{id}/unban:
 *   post:
 *     tags: [Admin]
 *     summary: Unban user account
 *     description: |
 *       Removes the ban from a user account, restoring their access.
 *       Only accessible by administrators.
 *       
 *       **Authentication Required**: Bearer token with admin role
 *       **Rate Limiting**: 3 requests per 15 minutes (sensitive operation)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     responses:
 *       200:
 *         description: User unbanned successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             examples:
 *               success:
 *                 summary: User unbanned successfully
 *                 value:
 *                   success: true
 *                   message: "User unbanned successfully"
 *                   meta:
 *                     user:
 *                       id: "user_123"
 *                       email: "unbanned.user@example.com"
 *                       status: "active"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: User is not banned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notBanned:
 *                 summary: User is not banned
 *                 value:
 *                   success: false
 *                   message: "User is not currently banned"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'

/**
 * @swagger
 * /api/users/bulk-delete:
 *   post:
 *     tags: [Admin]
 *     summary: Bulk delete multiple users
 *     description: |
 *       Deletes multiple user accounts in a single operation.
 *       Provides detailed results for each deletion attempt.
 *       
 *       **Authentication Required**: Bearer token with admin role
 *       **Rate Limiting**: 3 requests per 15 minutes (sensitive operation)
 *       
 *       **Limitations**:
 *       - Maximum 100 users per request
 *       - Cannot delete admin accounts
 *       - Skips non-existent user IDs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkDelete'
 *           examples:
 *             bulkDelete:
 *               summary: Delete multiple users
 *               value:
 *                 userIds:
 *                   - "user_123"
 *                   - "user_456"
 *                   - "user_789"
 *     responses:
 *       200:
 *         description: Bulk deletion completed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         summary:
 *                           type: object
 *                           properties:
 *                             success:
 *                               type: integer
 *                               description: Number of successfully deleted users
 *                             errors:
 *                               type: integer
 *                               description: Number of failed deletions
 *                             total:
 *                               type: integer
 *                               description: Total users processed
 *                         details:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               userId:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                                 enum: [success, error]
 *                               message:
 *                                 type: string
 *             examples:
 *               success:
 *                 summary: Bulk deletion results
 *                 value:
 *                   success: true
 *                   message: "Bulk deletion completed"
 *                   meta:
 *                     summary:
 *                       success: 2
 *                       errors: 1
 *                       total: 3
 *                     details:
 *                       - userId: "user_123"
 *                         status: "success"
 *                         message: "User deleted successfully"
 *                       - userId: "user_456"
 *                         status: "success"
 *                         message: "User deleted successfully"
 *                       - userId: "user_789"
 *                         status: "error"
 *                         message: "User not found"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get user statistics
 *     description: |
 *       Retrieves comprehensive statistics about users in the system.
 *       Includes counts by status, role, registration trends, and activity metrics.
 *       
 *       **Authentication Required**: Bearer token with admin role
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         stats:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               description: Total number of users
 *                             byStatus:
 *                               type: object
 *                               properties:
 *                                 active:
 *                                   type: integer
 *                                 inactive:
 *                                   type: integer
 *                                 banned:
 *                                   type: integer
 *                                 pending:
 *                                   type: integer
 *                             byRole:
 *                               type: object
 *                               properties:
 *                                 user:
 *                                   type: integer
 *                                 moderator:
 *                                   type: integer
 *                                 admin:
 *                                   type: integer
 *                             registrations:
 *                               type: object
 *                               properties:
 *                                 today:
 *                                   type: integer
 *                                 thisWeek:
 *                                   type: integer
 *                                 thisMonth:
 *                                   type: integer
 *                             lastLogin:
 *                               type: object
 *                               properties:
 *                                 today:
 *                                   type: integer
 *                                 thisWeek:
 *                                   type: integer
 *                                 thisMonth:
 *                                   type: integer
 *             examples:
 *               success:
 *                 summary: User statistics
 *                 value:
 *                   success: true
 *                   message: "User statistics retrieved successfully"
 *                   meta:
 *                     stats:
 *                       total: 1547
 *                       byStatus:
 *                         active: 1423
 *                         inactive: 89
 *                         banned: 24
 *                         pending: 11
 *                       byRole:
 *                         user: 1521
 *                         moderator: 23
 *                         admin: 3
 *                       registrations:
 *                         today: 12
 *                         thisWeek: 89
 *                         thisMonth: 234
 *                       lastLogin:
 *                         today: 156
 *                         thisWeek: 723
 *                         thisMonth: 1205
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */