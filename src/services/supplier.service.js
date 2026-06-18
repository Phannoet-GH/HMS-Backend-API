import { Supplier } from '../models/operations.model.js';

export const createSupplier = async (data) => {
    return await Supplier.create(data);
};

export const getAllSuppliers = async (filters = {}) => {
    const query = {};
    if (filters.search) {
        query.name = { $regex: filters.search.trim(), $options: 'i' };
    }

    return await Supplier.find(query).sort({ name: 1 });
};

export const getSupplierById = async (id) => {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
        const error = new Error('Supplier record not found');
        error.statusCode = 404;
        throw error;
    }
    return supplier;
};

export const updateSupplier = async (id, data) => {
    const supplier = await Supplier.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!supplier) {
        const error = new Error('Supplier record not found');
        error.statusCode = 404;
        throw error;
    }
    return supplier;
};

export const deleteSupplier = async (id) => {
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
        const error = new Error('Supplier record not found');
        error.statusCode = 404;
        throw error;
    }
    return supplier;
};

export default {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier
};