import express from 'express';
import * as controller from '../controllers/employee.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

const router = express.Router();

// 🔒 All employee management endpoints require an active session token
router.use(auth);

router.route('/')
    .get(rbac('r1', 'r2'), controller.getEmployees)             // Admins and Managers can view staff grids
    .post(rbac('r1', 'r2'), controller.createEmployee);          // Admins and Managers can add new hires

router.route('/:id')
    .get(rbac('r1', 'r2'), controller.getEmployeeById)          // View specific staff details
    .put(rbac('r1', 'r2'), controller.updateEmployee)         // Modify specific staff details
    .delete(rbac('r1'), controller.deleteEmployee);             // 🚨 ONLY strict Admins (r1) can delete profiles completely

export default router;