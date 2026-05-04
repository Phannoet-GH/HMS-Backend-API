const Booking = require('../models/booking.model');
const Guest = require('../models/guest.model');
const Room = require('../models/room.model');

exports.createBooking = async (data, userId) => {
  const room = await Room.findById(data.roomId);
  if (!room) {
    const error = new Error('Room not found');
    error.statusCode = 404;
    throw error;
  }

  if (room.status !== 'available') {
    const error = new Error('Room is not available');
    error.statusCode = 409;
    throw error;
  }

  const checkInDate = new Date(data.checkInDate);
  const checkOutDate = new Date(data.checkOutDate);

  if (!data.guest || Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    const error = new Error('Guest, check-in date, and check-out date are required');
    error.statusCode = 400;
    throw error;
  }

  if (checkOutDate <= checkInDate) {
    const error = new Error('Check-out date must be after check-in date');
    error.statusCode = 400;
    throw error;
  }

  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const guest = await Guest.create(data.guest);
  const booking = await Booking.create({
    guest: guest._id,
    room: room._id,
    checkInDate,
    checkOutDate,
    status: data.status || 'confirmed',
    totalAmount: nights * room.pricePerNight,
    createdBy: userId
  });

  room.status = 'reserved';
  await room.save();

  return Booking.findById(booking._id).populate('guest room createdBy', '-password');
};

exports.getBookings = (filters = {}) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.room) query.room = filters.room;

  return Booking.find(query)
    .populate('guest room createdBy', '-password')
    .sort({ createdAt: -1 });
};

exports.getBookingById = async (id) => {
  const booking = await Booking.findById(id).populate('guest room createdBy', '-password');
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }
  return booking;
};

exports.updateBookingStatus = async (id, status) => {
  const booking = await Booking.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate('guest room createdBy', '-password');

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (['checked_out', 'cancelled'].includes(status)) {
    await Room.findByIdAndUpdate(booking.room._id, { status: 'available' });
  }

  if (status === 'checked_in') {
    await Room.findByIdAndUpdate(booking.room._id, { status: 'occupied' });
  }

  return booking;
};
