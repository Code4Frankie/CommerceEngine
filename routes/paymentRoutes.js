// ShopCore API | routes/paymentRoutes.js
// Role: /api/v1/payments. The webhook route is registered in app.js (it needs the raw body).
// Owner: Stephanie Daniels (ST3)
import { Router } from 'express';
import { body } from 'express-validator';
import { initializePayment, verifyPayment } from '../controllers/paymentController.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.post('/initialize', protect, body('orderId').isMongoId().withMessage('A valid order id is required'), validate, initializePayment);
router.get('/verify/:reference', protect, verifyPayment);

export default router;
