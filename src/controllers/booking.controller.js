const bookingService = require('../services/booking.service');
const response = require('../utils/response');

exports.createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.body, req.user.id);
    response.created(res, booking, 'Booking created successfully');
  } catch (error) {
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getBookings(req.query);
    response.ok(res, bookings);
  } catch (error) {
    next(error);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    response.ok(res, booking);
  } catch (error) {
    next(error);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBookingStatus(req.params.id, req.body.status);
    response.ok(res, booking, 'Booking updated successfully');
  } catch (error) {
    next(error);
  }
};
