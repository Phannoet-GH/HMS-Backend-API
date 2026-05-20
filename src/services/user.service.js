import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

export const createUser = async (data) => {
  const { username, email, password, roleId = 'r3' } = data;

  if (!username || !email || !password) {
    const error = new Error('Username, email, and password are required');
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

  return sanitizeUser(user);
};

export const getUsers = async (filters = {}) => {
  const { search, roleId, skip = 0, limit = 10 } = filters;
  const query = {};

  if (search) {
    query.$or = [
      { username: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
  }

  if (roleId) {
    query.roleId = roleId;
  }

  const users = await User.find(query)
    .select('-password')
    .skip(Number(skip))
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  return { users, total };
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const updateUser = async (id, data) => {
  const { username, email, roleId } = data;

  const updateData = {};
  if (username) updateData.username = username;
  if (email) updateData.email = email;
  if (roleId) updateData.roleId = roleId;

  // Check if email is already taken by another user
  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      const error = new Error('Email is already in use');
      error.statusCode = 409;
      throw error;
    }
  }

  const user = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const updateUserPassword = async (id, data) => {
  const { currentPassword, newPassword } = data;

  if (!currentPassword || !newPassword) {
    const error = new Error('Current password and new password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 401;
    throw error;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  return sanitizeUser(user);
};

export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

function sanitizeUser(user) {
  const userObject = user.toObject ? user.toObject() : user;
  delete userObject.password;
  return userObject;
}

export default {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserPassword,
  deleteUser
};
