// ShopCore API | routes/cartRoutes.js
// Role: /api/v1/cart. All routes need a login.
// Owner: Tunde Fadipe (TU3)
import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem, clearCart } from '../controllers/cartController.js';
import { addItemRules, updateItemRules, productIdParam } from '../validators/cartValidator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', getCart);
router.post('/items', addItemRules, validate, addItem);
router.put('/items/:productId', updateItemRules, validate, updateItem);
router.delete('/items/:productId', productIdParam, validate, removeItem);
router.delete('/', clearCart);

export default router;
