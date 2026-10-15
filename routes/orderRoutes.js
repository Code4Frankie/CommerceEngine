// ShopCore API | routes/orderRoutes.js
// Role: /api/v1/orders. Customers place and view their orders; admins see all and update status.
// Owner: Anthony Edike (AN2, AN3)
import { Router } from 'express';
import { createOrder, myOrders, getOrder, allOrders, updateStatus, cancelOrder } from '../controllers/orderController.js';
import { orderRules, statusRules } from '../validators/orderValidator.js';
import { validate, idParam } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/role.js';

const router = Router();
router.use(protect);
router.post('/', orderRules, validate, createOrder);
router.get('/mine', myOrders); // must stay above '/:id'
router.get('/', restrictTo('admin'), allOrders);
router.get('/:id', idParam, validate, getOrder);
router.put('/:id/status', restrictTo('admin'), idParam, statusRules, validate, updateStatus);
router.put('/:id/cancel', idParam, validate, cancelOrder);

export default router;
