import { Department } from '../models/operations.model.js';

export const createDepartment = async (data) => {
    return await Department.create(data);
};

export const getAllDepartments = async () => {
    return await Department.find().sort({ name: 1 });
};

export const getDepartmentById = async (id) => {
    const dept = await Department.findById(id);
    if (!dept) {
        const error = new Error('Department record not found');
        error.statusCode = 404;
        throw error;
    }
    return dept;
};

export const updateDepartment = async (id, data) => {
    const dept = await Department.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!dept) {
        const error = new Error('Department record not found');
        error.statusCode = 404;
        throw error;
    }
    return dept;
};

export const deleteDepartment = async (id) => {
    const dept = await Department.findByIdAndDelete(id);
    if (!dept) {
        const error = new Error('Department record not found');
        error.statusCode = 404;
        throw error;
    }
    return dept;
};

export default {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
};