import { Employee } from '../models/operations.model.js';

export const createEmployee = async (data) => {
    return await Employee.create(data);
};

export const getAllEmployees = async (filters = {}) => {
    const query = {};
    if (filters.department) query.department = filters.department;

    return await Employee.find(query).sort({ fullName: 1 });
};

export const getEmployeeById = async (id) => {
    const employee = await Employee.findById(id);
    if (!employee) {
        const error = new Error('Employee file registry not found');
        error.statusCode = 404;
        throw error;
    }
    return employee;
};

export const updateEmployee = async (id, data) => {
    const employee = await Employee.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!employee) {
        const error = new Error('Employee file registry not found');
        error.statusCode = 404;
        throw error;
    }
    return employee;
};

export const deleteEmployee = async (id) => {
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
        const error = new Error('Employee file registry not found');
        error.statusCode = 404;
        throw error;
    }
    return employee;
};

export default {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};