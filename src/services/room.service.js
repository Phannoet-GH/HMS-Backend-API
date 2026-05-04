const Room = require('../models/room.model');

exports.createRoom = (data) => {
  return Room.create(data);
};

exports.getRooms = (filters = {}) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;

  return Room.find(query).sort({ roomNumber: 1 });
};

exports.getRoomById = async (id) => {
  const room = await Room.findById(id);
  if (!room) {
    const error = new Error('Room not found');
    error.statusCode = 404;
    throw error;
  }
  return room;
};

exports.updateRoom = async (id, data) => {
  const room = await Room.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  if (!room) {
    const error = new Error('Room not found');
    error.statusCode = 404;
    throw error;
  }

  return room;
};

exports.deleteRoom = async (id) => {
  const room = await Room.findByIdAndDelete(id);
  if (!room) {
    const error = new Error('Room not found');
    error.statusCode = 404;
    throw error;
  }
};
