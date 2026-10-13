import express from 'express';
import { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js'; // 🟢 Clean default import matching your file!
import { addToCartValidator, updateQuantityValidator } from '../validators/cartValidator.js';

const router = express.Router();

// Enforce token authentication checks globally across all cart execution entry links
router.use(protect);

router.route('/')
  .get(getCart)       // GET    /api/v1/cart -> View Cart
  .post(addToCartValidator, addToCart)     // POST   /api/v1/cart -> Add Item
  .delete(clearCart); // DELETE /api/v1/cart -> Empty Cart

router.route('/:productId')
.put(updateQuantityValidator, updateCartQuantity)  // PUT    /api/v1/cart/:productId -> Adjust Quantity
  .delete(removeFromCart);   // DELETE /api/v1/cart/:productId -> Drop Single Item

export default router;
