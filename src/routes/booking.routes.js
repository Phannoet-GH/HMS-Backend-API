import express from 'express';
const router = express.Router();

import * as bookingController from '../controllers/booking.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

// 🛡️ System Role Definitions (e.g., r1: Admin, r2: Manager, r4: Receptionist/Staff)
const bookingStaffRoles = ['r1', 'r2', 'r4'];

// 📋 Standard CRUD Operations
router.get('/', auth, rbac(...bookingStaffRoles), bookingController.getBookings);
router.get('/:id', auth, rbac(...bookingStaffRoles), bookingController.getBookingById);
router.post('/', auth, rbac(...bookingStaffRoles), bookingController.createBooking);
router.put('/:id', auth, rbac(...bookingStaffRoles), bookingController.updateBooking);

// 🔄 Standard Generic Status Transitions
router.patch('/:id/status', auth, rbac(...bookingStaffRoles), bookingController.updateBookingStatus);

// 🎯 Explicit Hotel Operational Lifecycle Targets
// Secures the dedicated check-in, check-out, and cancellation logic loops
router.post('/:id/check-in', auth, rbac(...bookingStaffRoles), bookingController.checkInBooking);
router.post('/:id/check-out', auth, rbac(...bookingStaffRoles), bookingController.checkOutBooking);
router.post('/:id/cancel', auth, rbac(...bookingStaffRoles), bookingController.cancelBooking);

// ❌ Destructive Actions (Restricted strictly to Admins 'r1' and Managers 'r2')
router.delete('/:id', auth, rbac('r1', 'r2'), bookingController.deleteBooking);

export default router;