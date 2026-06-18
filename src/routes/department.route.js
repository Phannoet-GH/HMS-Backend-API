import express from 'express';
import * as controller from '../controllers/department.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

const router = express.Router();
router.use(auth);

router.route('/')
    .get(rbac('r1', 'r2'), controller.getDepartments)
    .post(rbac('r1'), controller.createDepartment);

router.route('/:id')
    .get(rbac('r1', 'r2'), controller.getDepartmentById)
    .put(rbac('r1'), controller.updateDepartment)
    .delete(rbac('r1'), controller.deleteDepartment);

export default router;