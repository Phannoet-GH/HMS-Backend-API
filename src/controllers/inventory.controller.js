import inventoryService from '../services/inventory.service.js';
import response from '../utils/response.js';

export const createInventoryItem = async (req, res, next) => {
    try {
        const item = await inventoryService.createItem(req.body);
        response.created(res, item, 'Inventory item tracked successfully');
    } catch (error) {
        next(error);
    }
};

export const getInventoryItems = async (req, res, next) => {
    try {
        const items = await inventoryService.getAllItems(req.query);
        response.ok(res, items);
    } catch (error) {
        next(error);
    }
};

export const getInventoryItemById = async (req, res, next) => {
    try {
        const item = await inventoryService.getItemById(req.params.id);
        response.ok(res, item);
    } catch (error) {
        next(error);
    }
};

export const updateInventoryItem = async (req, res, next) => {
    try {
        const item = await inventoryService.updateItem(req.params.id, req.body);
        response.ok(res, item, 'Inventory parameters adjusted smoothly');
    } catch (error) {
        next(error);
    }
};

export const deleteInventoryItem = async (req, res, next) => {
    try {
        await inventoryService.deleteItem(req.params.id);
        response.ok(res, null, 'Inventory item deleted successfully');
    } catch (error) {
        next(error);
    }
};