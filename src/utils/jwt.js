import jwt from 'jsonwebtoken'; // 1. Use import

// 2. Add 'export' directly before the constant
export const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, roleId: user.roleId }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
    );
};