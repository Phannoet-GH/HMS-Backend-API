import Room from '../models/room.model.js';
import Booking from '../models/booking.model.js';

const allowedRoomTypes = ['single', 'double', 'suite', 'deluxe'];
// 🟢 UPDATED: Added 'dirty' and 'cleaning' to support housekeeping lifecycle
const allowedRoomStatuses = [
  'available',
  'occupied',
  'reserved',
  'dirty',
  'cleaning',
  'maintenance'
];
/**
 * Custom operational error factory helper.
 */
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * 🧹 Normalizes and validates incoming data inputs against inventory limits.
 */
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
      throw createError(`Invalid room type. Valid options are: ${allowedRoomTypes.join(', ')}`);
    }
    roomData.type = data.type;
  }

  if (!partial || data.pricePerNight !== undefined) {
    const pricePerNight = Number(data.pricePerNight);
    if (!Number.isFinite(pricePerNight) || pricePerNight < 0) {
      throw createError('Price per night must be a valid positive number');
    }
    roomData.pricePerNight = pricePerNight;
  }

  if (!partial || data.capacity !== undefined) {
    const capacity = Number(data.capacity);
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw createError('Capacity must be an integer of at least 1 person');
    }
    roomData.capacity = capacity;
  }

  if (data.status !== undefined) {
    if (!allowedRoomStatuses.includes(data.status)) {
      throw createError(`Invalid room status. Valid options are: ${allowedRoomStatuses.join(', ')}`);
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

/**
 * 🔏 Intercepts MongoDB engine conflicts for unique indexing flags.
 */
const handleDuplicateRoomNumber = (error) => {
  if (error?.code === 11000 && error?.keyPattern?.roomNumber) {
    throw createError('This room number configuration already exists in the registry', 409);
  }
  throw error;
};

/**
 * ➕ Registers a brand new physical room unit into the inventory system.
 */
export const createRoom = async (data) => {
  try {
    return await Room.create(normalizeRoomData(data));
  } catch (error) {
    handleDuplicateRoomNumber(error);
  }
};

/**
 * 📋 Pulls room lists matching optional type/status filter blocks.
 */
export const getRooms = async (filters = {}) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;

  // Optional search helper if the frontend passes a dynamic query parameter string
  if (filters.search) {
    query.roomNumber = new RegExp(filters.search.trim(), 'i');
  }

  return await Room.find(query).sort({ roomNumber: 1 });
};

/**
 * 🔍 Pulls a specific room configuration via its unique Object ID.
 */
export const getRoomById = async (id) => {
  const room = await Room.findById(id);
  if (!room) {
    throw createError('Room configuration file not found', 404);
  }
  return room;
};

/**
 * ✏️ Modifies targeted properties on a room record.
 */
export const updateRoom = async (id, data) => {
  try {
    const room = await Room.findByIdAndUpdate(
      id,
      normalizeRoomData(data, { partial: true }),
      { new: true, runValidators: true }
    );

    if (!room) {
      throw createError('Room configuration file not found', 404);
    }

    return room;
  } catch (error) {
    handleDuplicateRoomNumber(error);
  }
};

/**
 * ❌ Core Integrity Interceptor: Blocks the deletion of rooms tied to existing booking sheets.
 */
export const deleteRoom = async (id) => {
  // 🟢 Relational integrity guard matching your schema naming rules
  const linkedBooking = await Booking.exists({ roomId: id });
  if (linkedBooking) {
    throw createError('Room cannot be purged because it is linked to active or historic reservation logs', 409);
  }

  const room = await Room.findByIdAndDelete(id);
  if (!room) {
    throw createError('Room configuration file not found', 404);
  }

  return room;
};

// Export individual bindings alongside the unified default block to match your import strategies
export default {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom
};