import User from '../models/user.model.js';
import activityService from '../services/activity-log.service.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Assuming you use bcrypt for hashing passwords

export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, roleId } = req.body;  // ← read roleId not role

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      roleId: roleId || 'r4'   // ← save as roleId
    });

    await activityService.logSessionAction(
      newUser._id,
      'USER_REGISTRATION',
      'AUTH',
      `New staff profile created for ${newUser.username} (${newUser.email})`
    );

    res.status(201).json({
      message: 'Staff user registered successfully',
      userId: newUser._id
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Use roleId field to match DB document
    const roleId = user.roleId || user.role;

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        roleId: roleId          // ← consistent field name
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    await activityService.logSessionAction(
      user._id,
      'SESSION_START',
      'AUTH',
      `User ${user.username} successfully checked into terminal system.`
    );

    // Return shape that matches AuthResponse type
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        roleId: roleId
      }
    });
  } catch (error) {
    next(error);
  }
};
// ❌ LOGOUT ACTION
export const logoutUser = async (req, res, next) => {
  try {
    const actorId = req.user.userId;
    const username = req.user.username || 'Staff member';

    // 🟢 Stateful Auth Log: Triggers while token properties are verified active
    await activityService.logSessionAction(
      actorId,
      'SESSION_END',
      'AUTH',
      `User "${username}" manually dispatched an explicit sign-out command. Terminal session dropped.`
    );

    res.status(200).json({ message: 'Session disconnected safely' });
  } catch (error) {
    next(error);
  }
};