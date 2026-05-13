// 1. Use the default import for Express
import express from 'express'; 

// 2. Import your controllers (Ensure .js extension is present)
import { register, login } from '../controllers/auth.controller.js';

const router = express.Router();

// 3. Define your routes
router.post('/register', register);
router.post('/login', login);

export default router;
