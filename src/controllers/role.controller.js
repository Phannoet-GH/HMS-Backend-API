import Role from '../models/role.model.js';
import response from '../utils/response.js';

export const createRole = async (req, res, next) => {
    try {
        const role = await Role.create(req.body);
        response.created(res, role, 'System role registered successfully');
    } catch (error) {
        next(error);
    }
};

export const getRoles = async (req, res, next) => {
    try {
        const roles = await Role.find().sort({ roleId: 1 });
        response.ok(res, roles);
    } catch (error) {
        next(error);
    }
};

export const getRoleById = async (req, res, next) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).json({ message: 'Role clearance profile not found' });
        response.ok(res, role);
    } catch (error) {
        next(error);
    }
};

export const updateRole = async (req, res, next) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!role) return res.status(404).json({ message: 'Role not found' });
        response.ok(res, role, 'Role permissions updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteRole = async (req, res, next) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) return res.status(404).json({ message: 'Role not found' });
        response.ok(res, null, 'Role blueprint purged from environment');
    } catch (error) {
        next(error);
    }
};