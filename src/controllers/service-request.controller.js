import ServiceRequest from '../models/serviceRequest.model.js';
import response from '../utils/response.js';

export const createServiceRequest = async (req, res, next) => {
    try {
        console.log('MODEL SCHEMA KEYS:', Object.keys(ServiceRequest.schema.obj));
        const request = await ServiceRequest.create(req.body);
        response.created(res, request, 'Service request registered successfully');
    } catch (error) {
        next(error);
    }
};

export const getServiceRequests = async (req, res, next) => {
    try {
        const { status, roomNumber } = req.query;
        const query = {};
        if (status) query.status = status;
        if (roomNumber) query.roomNumber = roomNumber;

        const requests = await ServiceRequest.find(query)
            .populate('assignedTo', 'username email')
            .sort({ createdAt: -1 });
        response.ok(res, requests);
    } catch (error) {
        next(error);
    }
};

export const getServiceRequestById = async (req, res, next) => {
    try {
        const request = await ServiceRequest.findById(req.params.id).populate('assignedTo', 'username email');
        if (!request) return res.status(404).json({ message: 'Service request not found' });
        response.ok(res, request);
    } catch (error) {
        next(error);
    }
};

export const updateServiceRequest = async (req, res, next) => {
    try {
        const request = await ServiceRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!request) return res.status(404).json({ message: 'Service request not found' });
        response.ok(res, request, 'Service request updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteServiceRequest = async (req, res, next) => {
    try {
        const request = await ServiceRequest.findByIdAndDelete(req.params.id);
        if (!request) return res.status(404).json({ message: 'Service request not found' });
        response.ok(res, null, 'Service request removed successfully');
    } catch (error) {
        next(error);
    }
};