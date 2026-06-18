import express from 'express';
const router = express.Router();

import * as userController from '../controllers/user.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

// 📋 Global User Access: Reading your own token profile data
router.get('/me', auth, userController.getCurrentUser);
router.get('/current', auth, userController.getCurrentUser);

// 🔒 Administrative Infrastructure Controls: restricted solely to High Admin ('r1')
router.use(auth, rbac('r1'));

router.route('/')
    .get(userController.getUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUserById)
    .put(userController.updateUser)
    .delete(userController.deleteUser); // Triggers the soft-disable handler safely

router.patch('/:id/password', userController.updateUserPassword);

export default router;