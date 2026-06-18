import RoomServiceOrder from '../models/roomServiceOrder.model.js';
import response from '../utils/response.js';

export const createRoomServiceOrder = async (req, res, next) => {
    try {
        // 💡 Note: You can easily add auto-pricing multipliers or totals calculations here later!
        const order = await RoomServiceOrder.create(req.body);
        response.created(res, order, 'Room service order placed successfully');
    } catch (error) {
        next(error);
    }
};

export const getRoomServiceOrders = async (req, res, next) => {
    try {
        const { status, roomNumber } = req.query;
        const query = {};
        if (status) query.status = status;
        if (roomNumber) query.roomNumber = roomNumber;

        const orders = await RoomServiceOrder.find(query).sort({ createdAt: -1 });
        response.ok(res, orders);
    } catch (error) {
        next(error);
    }
};

export const getRoomServiceOrderById = async (req, res, next) => {
    try {
        const order = await RoomServiceOrder.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        response.ok(res, order);
    } catch (error) {
        next(error);
    }
};

export const updateRoomServiceOrder = async (req, res, next) => {
    try {
        const order = await RoomServiceOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        response.ok(res, order, 'Room service order updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteRoomServiceOrder = async (req, res, next) => {
    try {
        const order = await RoomServiceOrder.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        response.ok(res, null, 'Room service order deleted successfully');
    } catch (error) {
        next(error);
    }
};