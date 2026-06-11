// 1. Change 'require' to 'import'
// Note: Ensure your local model and utils also have .js extensions
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';

// 2. Change 'exports.register' to 'export const register'
export const register = async (data) => {
  const username = data.username?.trim();
  const email = data.email?.trim().toLowerCase();
  const password = data.password;
  const roleId = data.roleId || "r3";

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

// 3. Change 'exports.login' to 'export const login'
export const login = async (data) => {
  if (!data.email || !data.password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: data.email });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return { user: sanitizeUser(user), token };
};

// This function remains internal to the file, so no 'export' is needed
function sanitizeUser(user) {
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
}
