// ShopCore API | validators/cartValidator.js
// Role: input rules for cart routes.
// Owner: Tunde Fadipe (TU2)
import { body, param } from 'express-validator';

export const addItemRules = [
  body('productId').isMongoId().withMessage('A valid product id is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1').toInt(),
];
export const updateItemRules = [
  param('productId').isMongoId().withMessage('A valid product id is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1').toInt(),
];
export const productIdParam = [param('productId').isMongoId().withMessage('A valid product id is required')];
