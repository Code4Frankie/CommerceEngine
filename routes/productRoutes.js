// ShopCore API | routes/productRoutes.js
// Role: /api/v1/products. Anyone can browse; only admins can create, update, delete (with images).
// Owner: Ojelade Esther Omotoyosi (OJ2, OJ3) | uploads: Nge Chioma Rejoice (NG3)
import { Router } from 'express';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { productRules, productUpdateRules } from '../validators/productValidator.js';
import { validate, idParam } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/role.js';
import upload from '../middleware/upload.js';

const router = Router();
router.get('/', listProducts);
router.get('/:id', idParam, validate, getProduct);
// upload runs before the validators so form fields are already parsed
router.post('/', protect, restrictTo('admin'), upload.array('images', 5), productRules, validate, createProduct);
router.put('/:id', protect, restrictTo('admin'), upload.array('images', 5), idParam, productUpdateRules, validate, updateProduct);
router.delete('/:id', protect, restrictTo('admin'), idParam, validate, deleteProduct);

export default router;
