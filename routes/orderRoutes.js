import express from 'express';
import { createOrder, getMyOrders } from '../controllers/orderController.js';
import protect from '../middleware/auth.js'; // Protects endpoints with your JWT security check

const router = express.Router();

// Enforce strict account protection shield across all purchase processing pipelines
router.use(protect);

router.route('/')
  .post(createOrder); // POST /api/v1/orders -> Checkout cart

router.route('/my-orders')
  .get(getMyOrders);  // GET /api/v1/orders/my-orders -> View personal purchase history

export default router;
