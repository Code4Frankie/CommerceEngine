// controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Helper function to sign JSON Web Tokens (JWT) for secure user sessions
const signToken = (id, role) => {
  return jwt.sign(
    { id, role }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @desc    Register a brand new user profile
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => { // 🟢 Ensure 'next' is included right here!
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if a user record with this email address already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'This email address is already registered to an account.'
      });
    }

    // 2. Insert the user into MongoDB Atlas (Password hashes automatically in userModel)
    const newUser = await User.create({
      name,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'customer'
    });

    // 3. Issue a JWT session token for instant login onboarding
    const token = signToken(newUser._id, newUser.role);

    // 4. Send back the registration response profile
    return res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      }
    });
  } catch (error) {
    return next(error); // 🟢 Passes any unexpected database crashes safely down to your global app error handler
  }
};

/**
 * @desc    Authenticate credentials and sign in
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => { // 🟢 Ensure 'next' is included right here!
  try {
    const { email, password } = req.body;

    // 1. Search for the account and explicitly append the hidden password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email address or password configurations.'
      });
    }

    // 2. Check the candidate password string
    const isPasswordCorrect = await user.comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email address or password configurations.'
      });
    }

    // 3. Build a fresh web token instance for the user session
    const token = signToken(user._id, user.role);

    // 4. Send back user access data
    return res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};
