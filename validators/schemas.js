// validators/schemas.js
import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Account display name field is required.').isLength({ min: 2 }),
  body('email').trim().notEmpty().withMessage('Email address mapping is mandatory.').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Security access passkey is required.').isLength({ min: 6 })
];

export const loginValidator = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password field cannot be blank.')
];
