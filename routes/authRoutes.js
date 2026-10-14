import express from 'express';
import { register, login } from '../controllers/authController.js';
import { registerValidator, loginValidator, validateRequest } from '../validators/authValidator.js';

const router = express.Router();

// Comma-separated arguments to process data through checkpoints
router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);

export default router;
