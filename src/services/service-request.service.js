import { ServiceRequest } from '../models/operations.model.js';

export const createServiceRequest = async (data) => {
    if (data.assignedTo && !mongoose.Types.ObjectId.isValid(data.assignedTo)) {
        throw createError('Invalid Employee ID format provided', 400);
    }
    return await ServiceRequest.create(data);
};

export const getAllServiceRequests = async (filters = {}) => {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.roomNumber) query.roomNumber = filters.roomNumber;

    return await ServiceRequest.find(query)
        .populate('assignedTo', 'username email')
        .sort({ createdAt: -1 });
};

export const getServiceRequestById = async (id) => {
    const request = await ServiceRequest.findById(id).populate('assignedTo', 'username email');
    if (!request) {
        const error = new Error('Service request not found');
        error.statusCode = 404;
        throw error;
    }
    return request;
};

export const updateServiceRequest = async (id, data) => {
    const request = await ServiceRequest.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!request) {
        const error = new Error('Service request not found');
        error.statusCode = 404;
        throw error;
    }
    return request;
};

export const deleteServiceRequest = async (id) => {
    const request = await ServiceRequest.findByIdAndDelete(id);
    if (!request) {
        const error = new Error('Service request not found');
        error.statusCode = 404;
        throw error;
    }
    return request;
};

export default {
    createServiceRequest,
    getAllServiceRequests,
    getServiceRequestById,
    updateServiceRequest,
    deleteServiceRequest
};