// ShopCore API | routes/userRoutes.js
// Role: /api/v1/users: the logged-in user's own profile and password.
// Owner: Ogunsola Israel Oluwajomiloju (OG3)
import { Router } from 'express';
import { getMe, updateMe, changePassword } from '../controllers/userController.js';
import { changePasswordRules } from '../validators/authValidator.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect); // every route below needs a login
router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/me/password', changePasswordRules, validate, changePassword);

export default router;
