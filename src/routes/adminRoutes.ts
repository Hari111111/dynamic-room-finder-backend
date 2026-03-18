import { Router } from 'express';
import { getAdminSummary } from '../controllers/adminController';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/summary', requireAuth, requireAdmin, getAdminSummary);

export default router;
