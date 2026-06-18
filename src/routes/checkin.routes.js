import express from 'express';
import * as checkInController from '../controllers/checkin.controller.js';
import auth from '../middlewares/auth.middleware.js'; // Updated path & naming scheme
import rbac from '../middlewares/rbac.middleware.js';

const router = express.Router();

// 📋 Define standard front-desk roles authorized to manage check-ins
const authorizedStaff = ['r1', 'r2', 'r4'];

// Apply authentication globally to all sub-routes below
router.use(auth);

router.route('/')
    .get(rbac(...authorizedStaff), checkInController.getCheckIns)
    .post(rbac(...authorizedStaff), checkInController.createCheckIn);

router.route('/:id')
    .get(rbac(...authorizedStaff), checkInController.getCheckInById)
    .put(rbac(...authorizedStaff), checkInController.updateCheckIn)
    // ❌ Strictly lock down drop deletions to Admins ('r1') and Managers ('r2')
    .delete(rbac('r1', 'r2'), checkInController.deleteCheckIn);

router.patch('/:id/status', rbac(...authorizedStaff), checkInController.updateCheckInStatus);

export default router;