// ShopCore API | middleware/auth.js
// Role: protect. Checks the "Authorization: Bearer <token>" header and attaches the user to req.user.
// Owner: Ogunsola Israel Oluwajomiloju (OG2)
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new ApiError(401, 'Not authorised: token missing');
  const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET); // throws if invalid or expired
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'The user for this token no longer exists');
  req.user = user;
  next();
});

export default protect;
