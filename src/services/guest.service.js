const Guest = require('../models/guest.model');

exports.createGuest = (data) => {
  return Guest.create(data);
};

exports.getGuests = (filters = {}) => {
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

exports.updateGuest = async (id, data) => {
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

exports.deleteGuest = async (id) => {
  const guest = await Guest.findByIdAndDelete(id);

  if (!guest) {
    const error = new Error('Guest not found');
    error.statusCode = 404;
    throw error;
  }
};
