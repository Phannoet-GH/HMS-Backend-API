import * as userService from '../services/user.service.js';
import response from '../utils/response.js';

// ➕ CREATE INTERNAL SYSTEM USER
export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    response.created(res, user, 'Internal account registered successfully');
  } catch (error) {
    next(error);
  }
};

// 📋 GET ALL USERS (Returns paginated { users, total })
export const getUsers = async (req, res, next) => {
  try {
    const { users, total } = await userService.getUsers(req.query);
    response.ok(res, { users, total });
  } catch (error) {
    next(error);
  }
};

// 🔍 GET USER BY ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    response.ok(res, user);
  } catch (error) {
    next(error);
  }
};

// ✏️ UPDATE CORE USER PROPERTIES (Username, Email, Role)
export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    response.ok(res, user, 'User profile parameters modified successfully');
  } catch (error) {
    next(error);
  }
};

// 🔒 UPDATE PASSWORD ONLY
export const updateUserPassword = async (req, res, next) => {
  try {
    const user = await userService.updateUserPassword(req.params.id, req.body);
    response.ok(res, user, 'Account access password changed successfully');
  } catch (error) {
    next(error);
  }
};

// 🛑 SOFT DELETE: Disables the account instead of purging the row
export const deleteUser = async (req, res, next) => {
  try {
    // We pass req.params.id to a dedicated soft-delete service method
    const user = await userService.disableUserAccount(req.params.id);

    // Changed to response.ok with data object context for Angular UI tables
    response.ok(res, user, 'User account has been successfully disabled and locked out');
  } catch (error) {
    next(error);
  }
};

// 🔑 FETCH ACCOUNT PROFILE OF LOGGED-IN CALLER
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    response.ok(res, user);
  } catch (error) {
    next(error);
  }
};