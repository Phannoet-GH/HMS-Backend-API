import Guest from '../models/guest.model.js';
import Booking from '../models/booking.model.js';

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeGuestData = (data, { partial = false } = {}) => {
  const guestData = {};

  if (!partial || data.fullName !== undefined) {
    if (!data.fullName || !String(data.fullName).trim()) {
      throw createError('Guest full name is required');
    }
    guestData.fullName = String(data.fullName).trim();
  }

  if (!partial || data.phone !== undefined) {
    if (!data.phone || !String(data.phone).trim()) {
      throw createError('Guest phone is required');
    }
    guestData.phone = String(data.phone).trim();
  }

  if (data.email !== undefined) {
    guestData.email = String(data.email).trim().toLowerCase();
  }

  if (data.idNumber !== undefined) {
    guestData.idNumber = String(data.idNumber).trim();
  }

  if (data.address !== undefined) {
    guestData.address = String(data.address).trim();
  }

  return guestData;
};

export const createGuest = (data) => {
  return Guest.create(normalizeGuestData(data));
};

export const getGuests = (filters = {}) => {
  const query = {};

  if (filters.search) {
    query.$or = [
      { fullName: new RegExp(filters.search, 'i') },
      { email: new RegExp(filters.search, 'i') },
      { phone: new RegExp(filters.search, 'i') }
    ];
  }

  return Guest.find(query).sort({ createdAt: -1 });
};

export const getGuestById = async (id) => {
  const guest = await Guest.findById(id);

  if (!guest) {
    const error = new Error('Guest not found');
    error.statusCode = 404;
    throw error;
  }

  return guest;
};

export const updateGuest = async (id, data) => {
  const guest = await Guest.findByIdAndUpdate(id, normalizeGuestData(data, { partial: true }), {
    new: true,
    runValidators: true
  });

  if (!guest) {
    throw createError('Guest not found', 404);
  }

  return guest;
};

export const deleteGuest = async (id) => {
  const linkedBooking = await Booking.exists({ guest: id });
  if (linkedBooking) {
    throw createError('Guest cannot be deleted because it is used by bookings', 409);
  }

  const guest = await Guest.findByIdAndDelete(id);

  if (!guest) {
    throw createError('Guest not found', 404);
  }
};
export default {
  createGuest,
  getGuests,
  getGuestById,
  updateGuest,
  deleteGuest
};
