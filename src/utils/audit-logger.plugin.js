import { ActivityLog } from '../models/operations.model.js';
import { getContextUser } from './context.js';

/**
 * Normalizes the actor value to ensure it matches the Mongoose Schema expectation.
 */
const resolveSafeActor = () => {
    const rawActor = getContextUser();
    const isValidObjectId = typeof rawActor === 'string' && /^[0-9a-fA-F]{24}$/.test(rawActor);
    return isValidObjectId ? rawActor : null;
};

export const auditLoggerPlugin = (schema, options = {}) => {
    const moduleName = options.module || 'SYSTEM_MODULE';

    schema.post('save', async function (doc, next) {
        try {
            if (doc.constructor.modelName === 'ActivityLog') return next();

            await ActivityLog.create({
                actor: resolveSafeActor(),
                action: `CREATE_${doc.constructor.modelName.toUpperCase()}`,
                module: moduleName,
                targetCollection: doc.constructor.collection.name, // 🟢 FIXED: Required parameter added
                details: `Successfully initialized a new record in ${doc.constructor.modelName}. Document reference ID: ${doc._id}.`
            });
            next();
        } catch (err) {
            next(err);
        }
    });

    schema.post('findOneAndUpdate', async function (doc, next) {
        try {
            if (!doc) return next();
            const modelName = this.model.modelName;
            const collectionName = this.model.collection.name;

            await ActivityLog.create({
                actor: resolveSafeActor(),
                action: `UPDATE_${modelName.toUpperCase()}`,
                module: moduleName,
                targetCollection: collectionName, // 🟢 FIXED: Required parameter added
                details: `Modified configuration metrics on ${modelName} entry (ID: ${doc._id}). Current Status/Data: [${doc.status || 'Updated State'}].`
            });
            next();
        } catch (err) {
            next(err);
        }
    });

    schema.post('findOneAndDelete', async function (doc, next) {
        try {
            if (!doc) return next();
            const modelName = this.model.modelName;
            const collectionName = this.model.collection.name;

            await ActivityLog.create({
                actor: resolveSafeActor(),
                action: `DELETE_${modelName.toUpperCase()}`,
                module: moduleName,
                targetCollection: collectionName, // 🟢 FIXED: Required parameter added
                details: `Permanently purged record entry from ${modelName} registers (ID: ${doc._id}).`
            });
            next();
        } catch (err) {
            next(err);
        }
    });
};