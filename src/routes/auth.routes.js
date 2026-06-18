import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/auth.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', auth, logoutUser); // Needs auth middleware to read req.user

export default router;