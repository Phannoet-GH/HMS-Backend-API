// 1. Change 'require' to 'import' 
// CRITICAL: You MUST include the '.js' extension for local files
import * as authService from '../services/auth.service.js';

// 2. Change 'exports.register' to 'export const register'
export const register = async (req, res) => {
  try {
    // Note: I'm assuming your service returns the data
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// 3. Change 'exports.login' to 'export const login'
export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};