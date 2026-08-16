import { Router } from 'express';
import { getNotifications, markNotificationsRead, streamNotifications } from '../controllers/notificationController';
import { verifyJWT } from '../middlewares/auth';

const router = Router();

/**
 * @openapi
 * /notifications/stream:
 *   get:
 *     summary: Live notification feed via Server-Sent Events
 *     description: >
 *       Exempt from JWT verification because the browser EventSource API cannot set an
 *       Authorization header. Emits `event: notification` messages with a JSON-encoded
 *       Notification payload each time one is created.
 *     tags: [Notifications]
 *     security: []
 *     responses:
 *       200:
 *         description: text/event-stream connection
 *         content:
 *           text/event-stream:
 *             schema: { type: string }
 */
// SSE stream is exempt from JWT verification: EventSource cannot set an Authorization
// header, and the payload is non-sensitive system/Slack-simulator activity only.
router.get('/stream', streamNotifications);

// All remaining notification routes require JWT verification
router.use(verifyJWT);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: List all notifications (system logs and Slack simulator triggers)
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Array of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Notification' }
 */
router.get('/', getNotifications);

/**
 * @openapi
 * /notifications/read:
 *   post:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Success flag
 */
router.post('/read', markNotificationsRead);

export default router;
