import PurchaseOrder from '../models/purchase-order.model.js';
import response from '../utils/response.js';

export const createPurchaseOrder = async (req, res, next) => {
    try {
        const order = await PurchaseOrder.create(req.body);
        response.created(res, order, 'Purchase order initialized successfully');
    } catch (error) {
        next(error);
    }
};

export const getPurchaseOrders = async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) query.status = status;

        const orders = await PurchaseOrder.find(query).sort({ createdAt: -1 });
        response.ok(res, orders);
    } catch (error) {
        next(error);
    }
};

export const getPurchaseOrderById = async (req, res, next) => {
    try {
        const order = await PurchaseOrder.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Purchase order not found' });
        response.ok(res, order);
    } catch (error) {
        next(error);
    }
};

export const updatePurchaseOrder = async (req, res, next) => {
    try {
        const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!order) return res.status(404).json({ message: 'Purchase order not found' });
        response.ok(res, order, 'Purchase order updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deletePurchaseOrder = async (req, res, next) => {
    try {
        const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Purchase order not found' });
        response.ok(res, null, 'Purchase order deleted successfully');
    } catch (error) {
        next(error);
    }
};