// 1. Change require to import (Always include .js extension!)
import express from 'express';
const router = express.Router();

import * as guestController from '../controllers/guest.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

router.get('/', auth, rbac('r1', 'r2'), guestController.getGuests);
router.post('/', auth, rbac('r1', 'r2'), guestController.createGuest);
router.get('/:id', auth, rbac('r1', 'r2'), guestController.getGuestById);
router.patch('/:id', auth, rbac('r1', 'r2'), guestController.updateGuest);
router.delete('/:id', auth, rbac('r1'), guestController.deleteGuest);

// 2. Change module.exports to export default
export default router;