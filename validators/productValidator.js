// ShopCore API | validators/productValidator.js
// Role: input rules for products and categories.
// Owner: Ojelade Esther Omotoyosi (OJ2)
import { body } from 'express-validator';

export const productRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be 0 or more').toFloat(),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be 0 or more').toInt(),
  body('category').isMongoId().withMessage('A valid category id is required'),
];
export const productUpdateRules = [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be 0 or more').toFloat(),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be 0 or more').toInt(),
  body('category').optional().isMongoId().withMessage('A valid category id is required'),
];
export const categoryRules = [body('name').trim().notEmpty().withMessage('Category name is required')];
