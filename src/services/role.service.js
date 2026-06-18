import Role from '../models/role.model.js';

export const createRole = async (data) => {
    return await Role.create(data);
};

export const getAllRoles = async () => {
    return await Role.find().sort({ roleId: 1 });
};

export const getRoleById = async (id) => {
    const role = await Role.findById(id);
    if (!role) {
        const error = new Error('System authorization role layout not found');
        error.statusCode = 404;
        throw error;
    }
    return role;
};

export const updateRole = async (id, data) => {
    const role = await Role.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!role) {
        const error = new Error('System authorization role layout not found');
        error.statusCode = 404;
        throw error;
    }
    return role;
};

export const deleteRole = async (id) => {
    const role = await Role.findByIdAndDelete(id);
    if (!role) {
        const error = new Error('System authorization role layout not found');
        error.statusCode = 404;
        throw error;
    }
    return role;
};

export default {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole
};