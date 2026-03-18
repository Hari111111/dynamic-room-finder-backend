import { Router } from 'express';
import { getAdminDashboard, updateAdminApproval } from '../controllers/adminController';
import { requireAdmin, requireAuth, requireSuperadmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/dashboard', requireAuth, requireAdmin, getAdminDashboard);
router.patch('/users/:id/approval', requireAuth, requireSuperadmin, updateAdminApproval);

export default router;
