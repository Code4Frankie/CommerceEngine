// ShopCore API | middleware/validate.js
// Role: turns express-validator results into one clear 400 error. idParam checks :id is a valid MongoDB id.
// Owner: Abe Enoch (AB1)
import { validationResult, param } from 'express-validator';
import ApiError from '../utils/ApiError.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return next(new ApiError(400, errors.array().map((e) => e.msg).join(', ')));
};

export const idParam = param('id').isMongoId().withMessage('Invalid id');

export default validate;