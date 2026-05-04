const router = require('express').Router();

const bookingController = require('../controllers/booking.controller');
const auth = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');

router.get('/', auth, rbac('r1', 'r2'), bookingController.getBookings);
router.get('/:id', auth, rbac('r1', 'r2'), bookingController.getBookingById);
router.post('/', auth, rbac('r1', 'r2'), bookingController.createBooking);
router.patch('/:id/status', auth, rbac('r1', 'r2'), bookingController.updateBookingStatus);

module.exports = router;
