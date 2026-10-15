// ShopCore API | routes/reviewRoutes.js
// Role: /api/v1/reviews/products/:id. Anyone can read; logged-in buyers can write.
// Owner: Oyelekan Oluseye (OY3)
import { Router } from 'express';
import { body } from 'express-validator';
import { addReview, listReviews } from '../controllers/reviewController.js';
import { validate, idParam } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const reviewRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be from 1 to 5').toInt(),
  body('comment').optional().trim(),
];

const router = Router();
router.get('/products/:id', idParam, validate, listReviews);
router.post('/products/:id', protect, idParam, reviewRules, validate, addReview);

export default router;
