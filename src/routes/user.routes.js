import express from 'express';
const router = express.Router();

import * as userController from '../controllers/user.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

// Protected routes
router.post('/', auth, rbac('r1'), userController.createUser);
router.get('/current', auth, userController.getCurrentUser);
router.get('/', auth, rbac('r1'), userController.getUsers);
router.get('/:id', auth, rbac('r1'), userController.getUserById);
router.patch('/:id', auth, rbac('r1'), userController.updateUser);
router.patch('/:id/password', auth, userController.updateUserPassword);
router.delete('/:id', auth, rbac('r1'), userController.deleteUser);

export default router;
