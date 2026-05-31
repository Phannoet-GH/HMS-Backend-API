import Room from '../models/room.model.js';
import Booking from '../models/booking.model.js';

const allowedRoomTypes = ['single', 'double', 'suite', 'deluxe'];
const allowedRoomStatuses = ['available', 'occupied', 'maintenance', 'reserved'];

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeRoomData = (data, { partial = false } = {}) => {
  const roomData = {};

  if (!partial || data.roomNumber !== undefined) {
    if (!data.roomNumber || !String(data.roomNumber).trim()) {
      throw createError('Room number is required');
    }
    roomData.roomNumber = String(data.roomNumber).trim();
  }

  if (!partial || data.type !== undefined) {
    if (!allowedRoomTypes.includes(data.type)) {
      throw createError('Room type is invalid');
    }
    roomData.type = data.type;
  }

  if (!partial || data.pricePerNight !== undefined) {
    const pricePerNight = Number(data.pricePerNight);
    if (!Number.isFinite(pricePerNight) || pricePerNight < 0) {
      throw createError('Price per night must be a positive number');
    }
    roomData.pricePerNight = pricePerNight;
  }

  if (!partial || data.capacity !== undefined) {
    const capacity = Number(data.capacity);
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw createError('Capacity must be at least 1');
    }
    roomData.capacity = capacity;
  }

  if (data.status !== undefined) {
    if (!allowedRoomStatuses.includes(data.status)) {
      throw createError('Room status is invalid');
    }
    roomData.status = data.status;
  } else if (!partial) {
    roomData.status = 'available';
  }

  if (data.description !== undefined) {
    roomData.description = String(data.description).trim();
  } else if (!partial) {
    roomData.description = '';
  }

  return roomData;
};

const handleDuplicateRoomNumber = (error) => {
  if (error?.code === 11000 && error?.keyPattern?.roomNumber) {
    throw createError('Room number already exists', 409);
  }

  throw error;
};

export const createRoom = async (data) => {
  try {
    return await Room.create(normalizeRoomData(data));
  } catch (error) {
    handleDuplicateRoomNumber(error);
  }
};

export const getRooms = (filters = {}) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;

  return Room.find(query).sort({ roomNumber: 1 });
};

export const getRoomById = async (id) => {
  const room = await Room.findById(id);
  if (!room) {
    const error = new Error('Room not found');
    error.statusCode = 404;
    throw error;
  }
  return room;
};

export const updateRoom = async (id, data) => {
  try {
    const room = await Room.findByIdAndUpdate(id, normalizeRoomData(data, { partial: true }), {
      new: true,
      runValidators: true
    });

    if (!room) {
      throw createError('Room not found', 404);
    }

    return room;
  } catch (error) {
    handleDuplicateRoomNumber(error);
  }
};

export const deleteRoom = async (id) => {
  const linkedBooking = await Booking.exists({ room: id });
  if (linkedBooking) {
    throw createError('Room cannot be deleted because it is used by bookings', 409);
  }

  const room = await Room.findByIdAndDelete(id);
  if (!room) {
    throw createError('Room not found', 404);
  }
};
export default {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom
};
