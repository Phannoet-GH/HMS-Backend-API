const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

// REGISTER
exports.register = async (data) => {
  if (!data.username || !data.email || !data.password) {
    const error = new Error('Username, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    username: data.username,
    email: data.email,
    password: hashed,
    roleId: data.roleId || "r3"
  });

  const token = generateToken(user);

  return { user: sanitizeUser(user), token };
};

// LOGIN
exports.login = async (data) => {
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

function sanitizeUser(user) {
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
}
