// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new ApiError(401, 'Not authorised: token missing');
  
  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'The user for this token no longer exists');
  
  req.user = user;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Permission denied. You do not have authorization to view this resource.');
    }
    next();
  };
};

export default protect;
