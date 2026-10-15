// ShopCore API | controllers/userController.js
// Role: the logged-in user's profile, change password, forgot and reset password.
// Owner: Ogunsola Israel Oluwajomiloju (OG3)
import crypto from 'node:crypto';
import User from '../models/userModel.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import { sendEmail } from '../services/emailService.js';

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body; // email and role cannot be changed here
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  await req.user.save();
  res.json({ success: true, user: req.user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) throw new ApiError(401, 'Current password is incorrect');
  user.password = req.body.newPassword; // hashed by the model
  await user.save();
  res.json({ success: true, message: 'Password changed' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const token = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const clientUrl = (process.env.CLIENT_URLS || 'http://localhost:5173').split(',')[0].trim();
    const link = `${clientUrl}/reset-password/${token}`;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your ShopCore password',
        text: `Use this link to reset your password. It expires in 15 minutes:\n${link}`,
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApiError(500, 'Could not send the reset email. Try again later');
    }
  }
  // same answer whether or not the email exists
  res.json({ success: true, message: 'If that email is registered, a reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } });
  if (!user) throw new ApiError(400, 'Reset link is invalid or has expired');
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ success: true, token: generateToken(user._id), message: 'Password reset' });
});
