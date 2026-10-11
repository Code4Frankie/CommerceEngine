// models/userModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'An account display name is required.'],
    trim: true,
    minlength: [2, 'Names must be at least 2 characters long.']
  },
  email: {
    type: String,
    required: [true, 'An email address is required.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid structural email format.']
  },
  password: {
    type: String,
    required: [true, 'A security access password is required.'],
    minlength: [6, 'Passwords must be at least 6 characters long.'],
    select: false // Hides the password field from normal API query results for safety
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  passwordResetToken: String,
  passwordResetExpires: Date
}, { 
  timestamps: true // Automatically manages createdAt and updatedAt tracking records
});

/**
 * Pre-Save Automation Hook
 * Automatically runs right before saving a document to hash newly created or modified passwords.
 */
userSchema.pre('save', async function(next) {
  // If the password field wasn't modified, skip hashing to avoid double-encrypting it
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a secure salt with 12 validation cycles and encrypt the password string
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance Helper Method
 * Compares an incoming login password string against the encrypted database hash securely.
 */
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// This line handles the default export your controller was searching for!
const User = mongoose.model('User', userSchema);
export default User;
