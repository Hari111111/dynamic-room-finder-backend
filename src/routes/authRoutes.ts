import { Router } from 'express';
import {
  listWishlist,
  login,
  me,
  removeRoomFromWishlist,
  saveRoomToWishlist,
  signup,
} from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.get('/wishlist', requireAuth, listWishlist);
router.post('/wishlist/:roomId', requireAuth, saveRoomToWishlist);
router.delete('/wishlist/:roomId', requireAuth, removeRoomFromWishlist);

export default router;
