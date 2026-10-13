import { body } from 'express-validator';
import { validateRequest } from './authValidator.js'; // Imports your reusable error catcher

export const addToCartValidator = [
  body('productId')
    .notEmpty().withMessage('Product ID is required to add an item to the cart.')
    .isMongoId().withMessage('Invalid Product ID format. Must be a valid 24-character hex string.'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be a whole number and at least 1.'),
    
  validateRequest // Express-validator checkpoint interceptor
];

export const updateQuantityValidator = [
  body('quantity')
    .notEmpty().withMessage('Quantity value is required.')
    .isInt({ min: 1 }).withMessage('Quantity must be a whole number and at least 1.'),
    
  validateRequest
];
