// Change this:
// const router = require('express').Router();
// To this:
import express from 'express';
const router = express.Router();

// Change these imports:
import * as bookingController from '../controllers/booking.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

router.get('/', auth, rbac('r1', 'r2'), bookingController.getBookings);
router.get('/:id', auth, rbac('r1', 'r2'), bookingController.getBookingById);
router.post('/', auth, rbac('r1', 'r2'), bookingController.createBooking);
router.patch('/:id/status', auth, rbac('r1', 'r2'), bookingController.updateBookingStatus);

// Change this:
// module.exports = router;
// To this:
export default router;