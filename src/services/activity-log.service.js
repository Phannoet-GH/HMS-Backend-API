import { ActivityLog } from '../models/operations.model.js';

export const logSessionAction = async (userId, actionType, details = '') => {
    try {
        await ActivityLog.create({
            actor: userId || null,
            action: actionType,                     // e.g., 'USER_LOGIN'
            module: 'AUTH',
            targetCollection: 'users',             // 🟢 FIXED: Satisfies validation constraints
            details: details || `User authentication event verified.`
        });
    } catch (err) {
        // Log the audit failure to terminal, but don't rethrow it. 
        // This keeps the user's actual login experience running smoothly!
        console.error("⚠️ Failed to write audit trail record:", err.message);
    }
};
export default { logSessionAction};