// ShopCore API | routes/adminRoutes.js
// Role: /api/v1/admin. Admins only: user list, delete user, sales stats.
// Owner: Oyelekan Oluseye (OY2, OY3)
import { Router } from 'express';
import { listUsers, deleteUser, salesStats } from '../controllers/adminController.js';
import { validate, idParam } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/role.js';

const router = Router();
router.use(protect, restrictTo('admin'));
router.get('/users', listUsers);
router.delete('/users/:id', idParam, validate, deleteUser);
router.get('/stats', salesStats);

export default router;
