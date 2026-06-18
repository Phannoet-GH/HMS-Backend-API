import roomService from '../services/room.service.js';
import response from '../utils/response.js';

// ➕ REGISTER NEW ROOM UNIT
export const createRoom = async (req, res, next) => {
  try {
    const room = await roomService.createRoom(req.body);
    response.created(res, room, 'Hotel room configuration registered successfully');
  } catch (error) {
    next(error);
  }
};

// 📋 GET ALL ROOM UNITS (Supports search query matrix flags)
export const getRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.getRooms(req.query);
    response.ok(res, rooms);
  } catch (error) {
    next(error);
  }
};

// 🔍 GET SINGLE ROOM BY ID
export const getRoomById = async (req, res, next) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    response.ok(res, room);
  } catch (error) {
    next(error);
  }
};

// ✏️ UPDATE ROOM PARAMETERS (Rates, features, or housekeeping states)
export const updateRoom = async (req, res, next) => {
  try {
    const room = await roomService.updateRoom(req.params.id, req.body);
    response.ok(res, room, 'Hotel room unit parameters modified successfully');
  } catch (error) {
    next(error);
  }
};

// ❌ PURGE ROOM UNIT FROM DATABASE
export const deleteRoom = async (req, res, next) => {
  try {
    await roomService.deleteRoom(req.params.id);
    // 🟢 Uniform response handler matching your system layout
    response.ok(res, null, 'Hotel room configuration permanently purged from active directory');
  } catch (error) {
    next(error);
  }
};