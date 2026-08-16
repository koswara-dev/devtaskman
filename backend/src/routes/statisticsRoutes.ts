import { Router } from 'express';
import { getStatistics, generateReportPdf } from '../controllers/statisticsController';
import { verifyJWT, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles(['Admin', 'PM', 'DevLeader', 'QALeader']));

/**
 * @openapi
 * /statistics:
 *   get:
 *     summary: Aggregate task statistics for dashboard reporting (Admin, PM, DevLeader, QALeader only)
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: dueSoonDays
 *         schema: { type: integer, default: 3 }
 *         description: Window in days for counting non-Done tasks due soon
 *     responses:
 *       200:
 *         description: Aggregate statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTasks: { type: integer }
 *                 statusCounts: { type: object, additionalProperties: { type: integer } }
 *                 priorityCounts: { type: object, additionalProperties: { type: integer } }
 *                 assigneeBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId: { type: string }
 *                       userName: { type: string }
 *                       completed: { type: integer }
 *                       total: { type: integer }
 *                 dueSoonCount: { type: integer }
 *                 dueSoonDays: { type: integer }
 *       403:
 *         description: Role not in the reporting audience
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/', getStatistics);

/**
 * @openapi
 * /statistics/report.pdf:
 *   get:
 *     summary: Downloadable PDF rendering of the statistics report (Admin, PM, DevLeader, QALeader only)
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: dueSoonDays
 *         schema: { type: integer, default: 3 }
 *         description: Window in days for counting non-Done tasks due soon
 *     responses:
 *       200:
 *         description: PDF report
 *         content:
 *           application/pdf:
 *             schema: { type: string, format: binary }
 *       403:
 *         description: Role not in the reporting audience
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/report.pdf', generateReportPdf);

export default router;
