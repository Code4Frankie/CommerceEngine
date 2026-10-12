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
  timestamps: true 
});

/**
 * Modern Pre-Save Hook
 * 🟢 FIX: We do NOT pass 'next' into the arguments. 
 * Simply returning out of an async function handles the 'next' signal automatically!
 */
userSchema.pre('save', async function() {
  // If the password field wasn't touched or changed, exit the hook early
  if (!this.isModified('password')) return;
  
  // Generate a secure encryption salt with 12 cycles and hash the password string
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance Helper Method
 * Compares an incoming login password string against the encrypted database hash securely.
 */
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
export default User;
