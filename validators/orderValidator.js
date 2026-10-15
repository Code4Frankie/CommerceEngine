// ShopCore API | validators/orderValidator.js
// Role: input rules for orders (shipping address and status updates).
// Owner: Anthony Edike (AN2)
import { body } from 'express-validator';

export const orderRules = [
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Full name is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Phone number is required'),
  body('shippingAddress.address').trim().notEmpty().withMessage('Shipping address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
];
export const statusRules = [
  body('status').isIn(['shipped', 'delivered', 'cancelled']).withMessage('Status must be shipped, delivered or cancelled'),
];
