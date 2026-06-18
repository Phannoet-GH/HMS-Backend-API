import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { sanitizeUser } from '../utils/user.util.js'; // Using your clean global shared utility

/**
 * ➕ Creates a new internal user account with pre-hash encryption.
 */
export const createUser = async (data) => {
  const { username, email, password, roleId = 'r3' } = data;

  if (!username || !email || !password) {
    const error = new Error('Username, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const hashed = await bcrypt.hash(password, 10);

  // Defaulting new accounts to active: true
  const user = await User.create({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: hashed,
    roleId,
    isActive: true
  });

  return sanitizeUser(user);
};

/**
 * 📋 Retrieves user profiles using search/role filters, pagination bounds, and status checks.
 */
export const getUsers = async (filters = {}) => {
  const { search, roleId, skip = 0, limit = 10, includeDisabled = 'false' } = filters;

  // 🟢 Soft-delete safety filtering rule
  // Admins can pass includeDisabled=true to audit terminated staff, otherwise default to active users only
  const query = includeDisabled === 'true' ? {} : { isActive: true };

  if (search) {
    query.$or = [
      { username: new RegExp(search.trim(), 'i') },
      { email: new RegExp(search.trim(), 'i') }
    ];
  }

  if (roleId) {
    query.roleId = roleId;
  }

  const users = await User.find(query)
    .select('-password -__v')
    .skip(Number(skip))
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  return { users, total };
};

/**
 * 🔍 Locates an individual profile context by its database ID.
 */
export const getUserById = async (id) => {
  // Filters out disabled profiles during standard checks
  const user = await User.findOne({ _id: id, isActive: true }).select('-password -__v');

  if (!user) {
    const error = new Error('Active user account registry file not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * ✏️ Modifies basic profile field properties safely.
 */
export const updateUser = async (id, data) => {
  const { username, email, roleId } = data;
  const updateData = {};

  if (username) updateData.username = username.trim();
  if (roleId) updateData.roleId = roleId;

  if (email) {
    const cleanEmail = email.trim().toLowerCase();
    updateData.email = cleanEmail;

    // Duplicity interceptor: blocks hijacking an email active on another row account ID
    const existingUser = await User.findOne({ email: cleanEmail, _id: { $ne: id } });
    if (existingUser) {
      const error = new Error('Email is already in use by another active account profile');
      error.statusCode = 409;
      throw error;
    }
  }

  const user = await User.findOneAndUpdate(
    { _id: id, isActive: true }, // Ensure we don't accidentally edit a deactivated account
    updateData,
    { new: true, runValidators: true }
  ).select('-password -__v');

  if (!user) {
    const error = new Error('User profile statement not found or account is deactivated');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * 🔒 Authorizes and saves access credentials updates.
 */
export const updateUserPassword = async (id, data) => {
  const { currentPassword, newPassword } = data;

  if (!currentPassword || !newPassword) {
    const error = new Error('Current password and new password fields are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ _id: id, isActive: true });
  if (!user) {
    const error = new Error('User profile record not found or account is deactivated');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error('Current verification security password credentials mismatch');
    error.statusCode = 401;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('New password must match or exceed 6 characters');
    error.statusCode = 400;
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return sanitizeUser(user);
};

/**
 * 🛑 REFACTORED: Soft Delete (Disable Account) Pipeline
 * Secures historical data links by maintaining row keys while disabling future access.
 */
export const disableUserAccount = async (id) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true, runValidators: true }
  ).select('-password -__v');

  if (!user) {
    const error = new Error('Target user account registration file not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

// 📦 Bundle dynamic namespace methods to preserve file contracts
export default {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserPassword,
  disableUserAccount,
  deleteUser: disableUserAccount // Alias wrapper keeps your controller completely unbroken!
};