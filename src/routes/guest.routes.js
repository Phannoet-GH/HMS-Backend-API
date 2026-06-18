import express from 'express';
const router = express.Router();

import * as guestController from '../controllers/guest.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

// 📋 Staff roles allowed to read/write guest profiles (r1: Admin, r2: Manager, r4: Front Desk Staff)
const authorizedStaff = ['r1', 'r2', 'r4'];

router.route('/')
    .get(auth, rbac(...authorizedStaff), guestController.getGuests)
    .post(auth, rbac(...authorizedStaff), guestController.createGuest);

router.route('/:id')
    .get(auth, rbac(...authorizedStaff), guestController.getGuestById)
    .put(auth, rbac(...authorizedStaff), guestController.updateGuest)
    .patch(auth, rbac(...authorizedStaff), guestController.updateGuest)
    // ❌ Restrict hard profile deletions strictly to Admin and Managers
    .delete(auth, rbac('r1', 'r2'), guestController.deleteGuest);

export default router;