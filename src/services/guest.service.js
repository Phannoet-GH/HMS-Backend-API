import Guest from '../models/guest.model.js';
import Booking from '../models/booking.model.js';

/**
 * Custom operational error factory helper.
 */
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * 🧹 Normalizes and trims raw request parameters into safe database fields.
 */
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
      throw createError('Guest contact phone number is required');
    }
    guestData.phone = String(data.phone).trim();
  }

  if (data.email !== undefined && data.email !== null) {
    guestData.email = String(data.email).trim().toLowerCase();
  }

  if (data.idNumber !== undefined && data.idNumber !== null) {
    guestData.idNumber = String(data.idNumber).trim();
  }

  if (data.address !== undefined && data.address !== null) {
    guestData.address = String(data.address).trim();
  }

  return guestData;
};

/**
 * ➕ Registers a clean guest profile entry.
 */
export const createGuest = async (data) => {
  return await Guest.create(normalizeGuestData(data));
};

/**
 * 📋 Retrieves guest data grids matching fuzzy text search terms.
 */
export const getGuests = async (filters = {}) => {
  const query = {};

  if (filters.search) {
    const cleanSearch = filters.search.trim();
    query.$or = [
      { fullName: new RegExp(cleanSearch, 'i') },
      { email: new RegExp(cleanSearch, 'i') },
      { phone: new RegExp(cleanSearch, 'i') }
    ];
  }

  return await Guest.find(query).sort({ createdAt: -1 });
};

/**
 * 🔍 Locates an individual guest record profile by database Object ID.
 */
export const getGuestById = async (id) => {
  const guest = await Guest.findById(id);

  if (!guest) {
    throw createError('Guest profile document not found', 404);
  }

  return guest;
};

/**
 * ✏️ Updates targeted user contact entries dynamically using patch subsets.
 */
export const updateGuest = async (id, data) => {
  const guest = await Guest.findByIdAndUpdate(
    id,
    normalizeGuestData(data, { partial: true }),
    { new: true, runValidators: true }
  );

  if (!guest) {
    throw createError('Guest profile profile not found', 404);
  }

  return guest;
};

/**
 * ❌ Hard Deletion Interceptor: Blocks profile wipes if tied to historic logs.
 */
export const deleteGuest = async (id) => {
  // 🟢 Verified relation contract: checks against guestId to protect active logs
  const linkedBooking = await Booking.exists({ guestId: id });
  if (linkedBooking) {
    throw createError('Guest profile cannot be deleted because it is tied to active or historic reservation logs', 409);
  }

  const guest = await Guest.findByIdAndDelete(id);

  if (!guest) {
    throw createError('Guest profile document not found', 404);
  }

  return guest;
};

export default {
  createGuest,
  getGuests,
  getGuestById,
  updateGuest,
  deleteGuest
};