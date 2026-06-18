import { InventoryItem } from '../models/operations.model.js';

export const createItem = async (data) => await InventoryItem.create(data);

export const getAllItems = async (filters = {}) => {
    const query = {};
    if (filters.category) query.category = filters.category;
    if (filters.search) query.name = { $regex: filters.search.trim(), $options: 'i' };
    return await InventoryItem.find(query).sort({ name: 1 });
};

export const getItemById = async (id) => {
    const item = await InventoryItem.findById(id);
    if (!item) {
        const error = new Error('Inventory record file entry not located');
        error.statusCode = 404;
        throw error;
    }
    return item;
};

export const updateItem = async (id, data) => {
    const item = await InventoryItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!item) {
        const error = new Error('Inventory record file entry not located');
        error.statusCode = 404;
        throw error;
    }
    return item;
};

export const deleteItem = async (id) => {
    const item = await InventoryItem.findByIdAndDelete(id);
    if (!item) {
        const error = new Error('Inventory record file entry not located');
        error.statusCode = 404;
        throw error;
    }
    return item;
};

export default { createItem, getAllItems, getItemById, updateItem, deleteItem };