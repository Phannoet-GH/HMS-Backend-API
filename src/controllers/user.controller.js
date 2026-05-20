import * as userService from '../services/user.service.js';
import response from '../utils/response.js';

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    response.created(res, user, 'User created successfully');
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { users, total } = await userService.getUsers(req.query);
    response.ok(res, { users, total });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    response.ok(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    response.ok(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateUserPassword = async (req, res, next) => {
  try {
    const user = await userService.updateUserPassword(req.params.id, req.body);
    response.ok(res, user, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    response.noContent(res, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    response.ok(res, user);
  } catch (error) {
    next(error);
  }
};
