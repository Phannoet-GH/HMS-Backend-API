import jwt from 'jsonwebtoken';
import { userContextStorage } from '../utils/context.js';

export default (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access Denied: Missing Session Token' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Structural footprint: { userId, username, role }

    // Run downstream database operations inside the isolated storage thread
    userContextStorage.run({ userId: verified.userId }, () => {
      next();
    });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or Expired Token Layout' });
  }
};