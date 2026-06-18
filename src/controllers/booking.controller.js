import * as bookingService from '../services/booking.service.js';
import response from '../utils/response.js';

/**
 * Ensures a consistent response structure { data: T, message: string }
 * This solves the 'data' property mapping errors in your frontend service.
 */
const sendResponse = (res, data, message = 'Operation successful', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data // 🟢 Always wrapping in 'data' ensures your service's map(res => res.data) always works
  });
};

export const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.body, req.user.id);
    sendResponse(res, booking, 'Booking created successfully', 201);
  } catch (error) {
    next(error); // 🟢 Passes to central error handler
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getBookings(req.query);
    sendResponse(res, bookings, 'Bookings retrieved');
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    sendResponse(res, booking);
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBooking(req.params.id, req.body);
    sendResponse(res, booking, 'Booking updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    // 🟢 Debug log to see exactly what is being sent from the frontend
    console.log('Received status update:', status);

    const booking = await bookingService.updateBookingStatus(req.params.id, status);
    sendResponse(res, booking, `Status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

export const checkInBooking = async (req, res, next) => {
  try {
    const checkInData = {
      employeeId: req.body.employeeId || req.user.id,
      keyIssued: !!req.body.keyIssued,
      depositAmount: Number(req.body.depositAmount) || 0,
      paymentMethod: req.body.paymentMethod || 'none'
    };
    const result = await bookingService.processCheckIn(req.params.id, checkInData);
    sendResponse(res, result, 'Guest checked in successfully.');
  } catch (error) {
    next(error);
  }
};

export const checkOutBooking = async (req, res, next) => {
  try {
    const paymentDetails = { paymentMethod: req.body.paymentMethod || 'cash' };
    const result = await bookingService.processCheckOut(req.params.id, paymentDetails);
    sendResponse(res, result, 'Guest checked out successfully.');
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const result = await bookingService.processCancellation(req.params.id);
    sendResponse(res, result, 'Booking cancelled successfully.');
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    await bookingService.deleteBooking(req.params.id);
    sendResponse(res, null, 'Booking purged from system.');
  } catch (error) {
    next(error);
  }
};