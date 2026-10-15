// ShopCore API | routes/authRoutes.js
// Role: /api/v1/auth: register, login, forgot and reset password.
// Owner: Ogunsola Israel Oluwajomiloju (OG2, OG3)
import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { forgotPassword, resetPassword } from '../controllers/userController.js';
import { registerRules, loginRules, forgotPasswordRules, resetPasswordRules } from '../validators/authValidator.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();
router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordRules, validate, resetPassword);

export default router;
