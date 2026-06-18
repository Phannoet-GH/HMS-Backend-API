/**
 * Removes sensitive fields like passwords from the user object before sending it to the client.
 * @param {Object} user - The Mongoose document or plain JavaScript user object.
 * @returns {Object} The sanitized user object.
 */
export const sanitizeUser = (user) => {
    if (!user) return null;

    // If it's a Mongoose document, convert it to a plain JavaScript object
    const userObj = user.toObject ? user.toObject() : { ...user };

    // Delete sensitive fields completely
    delete userObj.password;
    delete userObj.__v;

    return userObj;
};