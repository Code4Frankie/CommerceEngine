// ShopCore API | routes/categoryRoutes.js
// Role: /api/v1/categories. Anyone can list; only admins can change.
// Owner: Ojelade Esther Omotoyosi (OJ2)
import { Router } from 'express';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { categoryRules } from '../validators/productValidator.js';
import { validate, idParam } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/role.js';

const router = Router();
router.get('/', listCategories);
router.post('/', protect, restrictTo('admin'), categoryRules, validate, createCategory);
router.put('/:id', protect, restrictTo('admin'), idParam, categoryRules, validate, updateCategory);
router.delete('/:id', protect, restrictTo('admin'), idParam, validate, deleteCategory);

export default router;
