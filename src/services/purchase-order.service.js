import { PurchaseOrder } from '../models/operations.model.js';

export const createPurchaseOrder = async (data) => {
    return await PurchaseOrder.create(data);
};

export const getAllPurchaseOrders = async (filters = {}) => {
    const query = {};
    if (filters.status) query.status = filters.status;

    return await PurchaseOrder.find(query).sort({ createdAt: -1 });
};

export const getPurchaseOrderById = async (id) => {
    const order = await PurchaseOrder.findById(id);
    if (!order) {
        const error = new Error('Purchase order record not found');
        error.statusCode = 404;
        throw error;
    }
    return order;
};

export const updatePurchaseOrder = async (id, data) => {
    const order = await PurchaseOrder.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!order) {
        const error = new Error('Purchase order record not found');
        error.statusCode = 404;
        throw error;
    }
    return order;
};

export const deletePurchaseOrder = async (id) => {
    const order = await PurchaseOrder.findByIdAndDelete(id);
    if (!order) {
        const error = new Error('Purchase order record not found');
        error.statusCode = 404;
        throw error;
    }
    return order;
};

export default {
    createPurchaseOrder,
    getAllPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrder,
    deletePurchaseOrder
};