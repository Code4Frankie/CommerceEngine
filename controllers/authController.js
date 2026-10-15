// ShopCore API | controllers/authController.js
// Role: register and login. Returns a token the app sends back in the Authorization header.
// Owner: Ogunsola Israel Oluwajomiloju (OG2)
import User from '../models/userModel.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

const sendAuth = (res, status, user) => res.status(status).json({ success: true, token: generateToken(user._id), user });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (await User.findOne({ email })) throw new ApiError(409, 'Email is already registered');
  const user = await User.create({ name, email, password, phone }); // role is always "customer" here
  sendAuth(res, 201, user);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  // same message for wrong email or wrong password, so attackers learn nothing
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Invalid email or password');
  sendAuth(res, 200, user);
});
