import { Router, Request, Response } from 'express';
import { resetInMemoryDB } from '../db/db';

const router = Router();

/**
 * @openapi
 * /reset:
 *   post:
 *     summary: Reset the in-memory database back to its original seed state
 *     tags: [Reset]
 *     security: []
 *     responses:
 *       200:
 *         description: Reset result
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    await resetInMemoryDB();
    return res.json({ success: true, message: 'Database successfully reset to original seed state.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal melakukan reset database.' });
  }
});

export default router;
