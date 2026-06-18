import Supplier from '../models/supplier.model.js';
import response from '../utils/response.js';

export const createSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.create(req.body);
        response.created(res, supplier, 'Supplier profile created successfully');
    } catch (error) {
        next(error);
    }
};

export const getSuppliers = async (req, res, next) => {
    try {
        const { search } = req.query;
        const query = {};
        if (search) {
            query.name = { $regex: search.trim(), $options: 'i' };
        }

        const suppliers = await Supplier.find(query).sort({ name: 1 });
        response.ok(res, suppliers);
    } catch (error) {
        next(error);
    }
};

export const getSupplierById = async (req, res, next) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        response.ok(res, supplier);
    } catch (error) {
        next(error);
    }
};

export const updateSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        response.ok(res, supplier, 'Supplier updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        response.ok(res, null, 'Supplier deleted successfully');
    } catch (error) {
        next(error);
    }
};