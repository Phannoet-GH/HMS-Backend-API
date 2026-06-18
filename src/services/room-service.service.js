import { RoomServiceOrder } from '../models/operations.model.js';

export const createRoomServiceOrder = async (data) => {
    // 💡 Future modification spot: Calculate order grand totals dynamically from menu pricing models
    return await RoomServiceOrder.create(data);
};

export const getAllRoomServiceOrders = async (filters = {}) => {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.roomNumber) query.roomNumber = filters.roomNumber;

    return await RoomServiceOrder.find(query).sort({ createdAt: -1 });
};

export const getRoomServiceOrderById = async (id) => {
    const order = await RoomServiceOrder.findById(id);
    if (!order) {
        const error = new Error('Room service order not found');
        error.statusCode = 404;
        throw error;
    }
    return order;
};

export const updateRoomServiceOrder = async (id, data) => {
    const order = await RoomServiceOrder.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!order) {
        const error = new Error('Room service order not found');
        error.statusCode = 404;
        throw error;
    }
    return order;
};

export const deleteRoomServiceOrder = async (id) => {
    const order = await RoomServiceOrder.findByIdAndDelete(id);
    if (!order) {
        const error = new Error('Room service order not found');
        error.statusCode = 404;
        throw error;
    }
    return order;
};

export default {
    createRoomServiceOrder,
    getAllRoomServiceOrders,
    getRoomServiceOrderById,
    updateRoomServiceOrder,
    deleteRoomServiceOrder
};