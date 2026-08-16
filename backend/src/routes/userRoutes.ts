import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, importUsers } from '../controllers/userController';
import { verifyJWT, authorizeRoles } from '../middlewares/auth';

const router = Router();

// User management routes require JWT verification
router.use(verifyJWT);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Array of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 */
router.get('/', getUsers);

/**
 * @openapi
 * /users/import:
 *   post:
 *     summary: Bulk import users from a parsed CSV payload (Admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [users]
 *             properties:
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name: { type: string }
 *                     email: { type: string }
 *                     role: { type: string }
 *                     avatarUrl: { type: string }
 *     responses:
 *       201:
 *         description: Import result
 *       403:
 *         description: Not an Admin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/import', authorizeRoles(['Admin']), importUsers);

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string }
 *               avatarUrl: { type: string }
 *     responses:
 *       201:
 *         description: Created user
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Validation error / email already registered
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Not an Admin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', authorizeRoles(['Admin']), createUser);

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Update a user's profile (role changes require Admin)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               role: { type: string }
 *               avatarUrl: { type: string }
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       403:
 *         description: Only Admin may change roles
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/:id', updateUser);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deletion result
 *       403:
 *         description: Not an Admin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', authorizeRoles(['Admin']), deleteUser);

export default router;
