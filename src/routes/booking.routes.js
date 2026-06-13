// Change this:
// const router = require('express').Router();
// To this:
import express from 'express';
const router = express.Router();

// Change these imports:
import * as bookingController from '../controllers/booking.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

const bookingStaffRoles = ['r1', 'r2', 'r4'];

router.get('/', auth, rbac(...bookingStaffRoles), bookingController.getBookings);
router.get('/:id', auth, rbac(...bookingStaffRoles), bookingController.getBookingById);
router.post('/', auth, rbac(...bookingStaffRoles), bookingController.createBooking);
router.patch('/:id', auth, rbac(...bookingStaffRoles), bookingController.updateBooking);
router.patch('/:id/status', auth, rbac(...bookingStaffRoles), bookingController.updateBookingStatus);
router.delete('/:id', auth, rbac('r1', 'r2'), bookingController.deleteBooking);

// Change this:
// module.exports = router;
// To this:
export default router;
