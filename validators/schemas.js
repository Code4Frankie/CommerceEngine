import { body, validationResult } from 'express-validator';

/**
 * Reusable validation execution middleware interceptor.
 * Catches validation errors and drops incomplete payloads before logic processing.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// 1. User Registration Payload Validation Arrays
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Account display name field is required.')
    .isLength({ min: 2 }).withMessage('Name must run at least 2 characters deep.'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email address mapping is mandatory.')
    .isEmail().withMessage('Please provide a valid structural email format.')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Security access passkey is required.')
    .isLength({ min: 6 }).withMessage('Passwords must be at least 6 characters long.')
];

// 2. User Authentication / Login Payload Validation Arrays
// 🟢 THIS LINE ADDS THE MISSING EXPORT RESOLVING YOUR SYNTAX CRASH!
export const loginValidator = [
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid structural email format.')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password field cannot be blank.')
];
