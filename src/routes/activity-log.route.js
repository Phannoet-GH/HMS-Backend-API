import express from 'express';
import { getAuditTrailByUser } from '../controllers/activity-log.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

const router = express.Router();

router.get('/trail/:userId', auth, rbac('r1'), getAuditTrailByUser);

export default router;