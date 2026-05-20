import Guest from '../models/guest.model.js';

export const createGuest = (data) => {
  return Guest.create(data);
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
  const guest = await Guest.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  if (!guest) {
    const error = new Error('Guest not found');
    error.statusCode = 404;
    throw error;
  }

  return guest;
};

export const deleteGuest = async (id) => {
  const guest = await Guest.findByIdAndDelete(id);

  if (!guest) {
    const error = new Error('Guest not found');
    error.statusCode = 404;
    throw error;
  }
};
export default {
  createGuest,
  getGuests,
  getGuestById,
  updateGuest,
  deleteGuest
};