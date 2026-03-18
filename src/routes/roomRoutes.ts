import { Router } from 'express';
import { createRoom, deleteRoom, getRoomById, listRooms, updateRoom } from '../controllers/roomController';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', listRooms);
router.get('/:id', getRoomById);
router.post('/', requireAuth, requireAdmin, createRoom);
router.put('/:id', requireAuth, requireAdmin, updateRoom);
router.delete('/:id', requireAuth, requireAdmin, deleteRoom);

export default router;
