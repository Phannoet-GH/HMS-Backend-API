import Booking from '../models/booking.model.js';
import Room from '../models/room.model.js';
import Guest from '../models/guest.model.js';

const validBookingStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getRoomStatusForBookingStatus = (status) => {
  if (status === 'checked_in') return 'occupied';
  if (['checked_out', 'cancelled'].includes(status)) return 'available';
  return 'reserved';
};

const syncRoomStatus = async (roomId, status) => {
  if (!roomId) return;

  const room = await Room.findByIdAndUpdate(
    roomId,
    { status: getRoomStatusForBookingStatus(status) },
    { new: true, runValidators: true }
  );

  if (!room) {
    throw createError('Room not found while syncing room status', 404);
  }

  return room;
};

const calculateNights = (checkInDate, checkOutDate) => {
  const nights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
  );

  return nights > 0 ? nights : 1;
};

export const createBooking = async (data, userId) => {

  const room = await Room.findById(data.roomId);

  if (!room) {
    throw createError('Room not found', 404);
  }

  if (room.status !== 'available') {
    throw createError('Room is not available', 409);
  }

  const checkInDate = new Date(data.checkInDate);
  const checkOutDate = new Date(data.checkOutDate);

  if (
    !data.guest ||
    Number.isNaN(checkInDate.getTime()) ||
    Number.isNaN(checkOutDate.getTime())
  ) {
    throw createError('Guest, check-in date, and check-out date are required');
  }

  if (checkOutDate <= checkInDate) {
    throw createError('Check-out date must be after check-in date');
  }

  if (data.status && !validBookingStatuses.includes(data.status)) {
    throw createError('Booking status is invalid');
  }

  const nights = calculateNights(checkInDate, checkOutDate);

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

  await syncRoomStatus(room._id, booking.status);

  return Booking.findById(booking._id)
    .populate('guest room createdBy', '-password');
};

export const getBookings = (filters = {}) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.room) query.room = filters.room;

  return Booking.find(query)
    .populate('guest room createdBy', '-password')
    .sort({ createdAt: -1 });
};

export const getBookingById = async (id) => {
  const booking = await Booking.findById(id)
    .populate('guest room createdBy', '-password');

  if (!booking) {
    throw createError('Booking not found', 404);
  }

  return booking;
};

export const updateBookingStatus = async (id, status) => {
  if (!validBookingStatuses.includes(status)) {
    throw createError('Booking status is invalid');
  }

  const booking = await Booking.findById(id);

  if (!booking) {
    throw createError('Booking not found', 404);
  }

  booking.status = status;
  await booking.save();
  await syncRoomStatus(booking.room, status);

  return Booking.findById(booking._id)
    .populate('guest room createdBy', '-password');
};

export const updateBooking = async (id, data) => {
  const booking = await Booking.findById(id);

  if (!booking) {
    throw createError('Booking not found', 404);
  }

  const updateData = {};
  const nextStatus = data.status || booking.status;

  if (data.status && !validBookingStatuses.includes(data.status)) {
    throw createError('Booking status is invalid');
  }

  let nextRoom = null;
  if (data.roomId && String(data.roomId) !== String(booking.room)) {
    nextRoom = await Room.findById(data.roomId);
    if (!nextRoom) {
      throw createError('Room not found', 404);
    }
    if (nextRoom.status !== 'available') {
      throw createError('Room is not available', 409);
    }
    updateData.room = nextRoom._id;
  } else {
    nextRoom = await Room.findById(booking.room);
  }

  const checkInDate = data.checkInDate ? new Date(data.checkInDate) : booking.checkInDate;
  const checkOutDate = data.checkOutDate ? new Date(data.checkOutDate) : booking.checkOutDate;

  if (
    Number.isNaN(checkInDate.getTime()) ||
    Number.isNaN(checkOutDate.getTime())
  ) {
    throw createError('Check-in date and check-out date must be valid dates');
  }

  if (checkOutDate <= checkInDate) {
    throw createError('Check-out date must be after check-in date');
  }

  if (data.guest && booking.guest) {
    await Guest.findByIdAndUpdate(booking.guest, data.guest, {
      runValidators: true
    });
  }

  updateData.checkInDate = checkInDate;
  updateData.checkOutDate = checkOutDate;
  updateData.status = nextStatus;

  if (nextRoom) {
    updateData.totalAmount = calculateNights(checkInDate, checkOutDate) * nextRoom.pricePerNight;
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('guest room createdBy', '-password');

  if (data.roomId && String(data.roomId) !== String(booking.room)) {
    await syncRoomStatus(booking.room, 'checked_out');
  }

  await syncRoomStatus(updatedBooking.room?._id || updatedBooking.room, updatedBooking.status);

  return updatedBooking;
};

export const deleteBooking = async (id) => {
  const booking = await Booking.findByIdAndDelete(id);

  if (!booking) {
    throw createError('Booking not found', 404);
  }

  await syncRoomStatus(booking.room, 'checked_out');

  return booking;
};
export default {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  updateBooking,
  deleteBooking
};
