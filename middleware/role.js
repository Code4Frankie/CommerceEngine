// ShopCore API | middleware/role.js
// Role: restrictTo('admin'). Lets only certain roles through. Use after protect.
// Owner: Ogunsola Israel Oluwajomiloju (OG2)
import ApiError from '../utils/ApiError.js';

export const restrictTo =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role) ? next() : next(new ApiError(403, 'You do not have permission to do this'));

export default restrictTo;
