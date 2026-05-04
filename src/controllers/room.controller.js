const roomService = require('../services/room.service');
const response = require('../utils/response');

exports.createRoom = async (req, res, next) => {
  try {
    const room = await roomService.createRoom(req.body);
    response.created(res, room, 'Room created successfully');
  } catch (error) {
    next(error);
  }
};

exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.getRooms(req.query);
    response.ok(res, rooms);
  } catch (error) {
    next(error);
  }
};

exports.getRoomById = async (req, res, next) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    response.ok(res, room);
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await roomService.updateRoom(req.params.id, req.body);
    response.ok(res, room, 'Room updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    await roomService.deleteRoom(req.params.id);
    response.noContent(res);
  } catch (error) {
    next(error);
  }
};
