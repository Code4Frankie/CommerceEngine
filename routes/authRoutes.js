// routes/authRoutes.js
import express from 'express';
import { register, login } from '../controllers/authController.js';
import { registerValidator, loginValidator, validateRequest } from '../validators/schemas.js';

const router = express.Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);

export default router;
