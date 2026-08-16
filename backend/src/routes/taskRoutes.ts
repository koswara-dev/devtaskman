import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask, addTaskComment } from '../controllers/taskController';
import { verifyJWT, authorizeRoles } from '../middlewares/auth';
import { body } from 'express-validator';

const router = Router();

const validateTaskPayload = [
  body('title').trim().notEmpty().withMessage('Judul tugas tidak boleh kosong.').isLength({ max: 150 }).withMessage('Judul tugas maksimal 150 karakter.').escape(),
  body('description').trim().isLength({ max: 1000 }).withMessage('Deskripsi tugas maksimal 1000 karakter.').escape(),
  body('priority').isIn(['High', 'Medium', 'Low']).withMessage('Nilai prioritas tidak valid.'),
  body('status').isIn(['Backlog', 'ToDo', 'InProgress', 'ReadyForQA', 'Testing', 'Done']).withMessage('Nilai status tidak valid.'),
  body('dueDate').isISO8601().withMessage('Format tenggat waktu tidak valid (wajib YYYY-MM-DD).'),
  body('startDate').optional().isISO8601().withMessage('Format tanggal mulai tidak valid (wajib YYYY-MM-DD).')
];

// All task routes require JWT verification
router.use(verifyJWT);

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: List all tasks with their comments and history
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Array of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Task' }
 */
router.get('/', getTasks);

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Create a new task (Admin, PM, DevLeader, or QALeader only)
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, priority, status, dueDate]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               priority: { type: string, enum: [High, Medium, Low] }
 *               status: { type: string, enum: [Backlog, ToDo, InProgress, ReadyForQA, Testing, Done] }
 *               assigneeId: { type: string, nullable: true }
 *               startDate: { type: string }
 *               dueDate: { type: string }
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Task' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Role not allowed to create tasks
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', authorizeRoles(['Admin', 'PM', 'DevLeader', 'QALeader']), validateTaskPayload, createTask);

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     summary: Update a task (fields and/or status transition)
 *     tags: [Tasks]
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
 *               title: { type: string }
 *               description: { type: string }
 *               priority: { type: string }
 *               status: { type: string }
 *               assigneeId: { type: string, nullable: true }
 *               startDate: { type: string }
 *               dueDate: { type: string }
 *               commentText: { type: string, description: 'Required when QA rejects Testing back to InProgress/ToDo' }
 *     responses:
 *       200:
 *         description: Updated task
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Task' }
 *       403:
 *         description: Role not allowed to make this status transition
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/:id', updateTask);

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deletion result
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', deleteTask);

/**
 * @openapi
 * /tasks/{id}/comments:
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text: { type: string }
 *     responses:
 *       201:
 *         description: Created comment
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Comment' }
 *       400:
 *         description: Empty comment
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/:id/comments', addTaskComment);

export default router;
