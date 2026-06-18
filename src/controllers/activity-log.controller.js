import activityService from '../services/activity-log.service.js';
import response from '../utils/response.js';
import { ActivityLog } from '../models/operations.model.js';

export const getAuditTrailByUser = async (req, res, next) => {
    try {
        const trail = await activityService.fetchSessionTrail(req.params.userId);
        response.ok(res, trail);
    } catch (error) {
        next(error);
    }
};