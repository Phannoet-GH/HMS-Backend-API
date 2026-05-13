import Room from '../models/room.model.js';

export const createRoom = (data) => {
  return Room.create(data);
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

export const deleteRoom = async (id) => {
  const room = await Room.findByIdAndDelete(id);
  if (!room) {
    const error = new Error('Room not found');
    error.statusCode = 404;
    throw error;
  }
};
export default {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom
}