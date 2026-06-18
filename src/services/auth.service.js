// 1. Native ES Modules Imports with explicit .js extensions
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js'; // Ensure your jwt utility exports generateToken cleanly

// 2. Export const for Named Registration Logic
export const register = async (data) => {
  const username = data.username?.trim();
  const email = data.email?.trim().toLowerCase();
  const password = data.password;
  const roleId = data.roleId || "r3"; // Default fallback (e.g., standard guest/user account)

  if (!username || !email || !password) {
    const error = new Error('Username, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  // Hash the raw text password safely before storing it in MongoDB
  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashed,
    roleId
  });

  const token = generateToken(user);

  return { user: sanitizeUser(user), token };
};

// 3. Export const for Named Login Logic
export const login = async (data) => {
  const email = data.email?.trim().toLowerCase();
  const password = data.password;

  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  // Inside services/auth.service.js -> login method:
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // 🛑 Immediate soft-delete lockout block!
  if (!user.isActive) {
    const error = new Error('This administrative account has been deactivated. Access denied.');
    error.statusCode = 403; // Forbidden
    throw error;
  }
  // Secure comparison against the database hash record
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return { user: sanitizeUser(user), token };
};

// 🔒 Internal Utility: Stays hidden inside this file scope (no export needed)
function sanitizeUser(user) {
  const userObject = user.toObject();
  delete userObject.password; // Drops the hash trace completely
  return userObject;
}