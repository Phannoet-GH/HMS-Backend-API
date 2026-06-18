import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || 'YOUR_BACKUP_DEVELOPMENT_SECRET';

    // 🪙 Flattening the payload structure so it reads beautifully inside your middlewares
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
            email: user.email,
            roleId: user.roleId // 🎯 Embedded here!
        },
        secret,
        { expiresIn: '8h' } // Standard operational shift window length
    );
};