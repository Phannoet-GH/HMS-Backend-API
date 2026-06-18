import express from 'express';
import * as controller from '../controllers/role.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

const router = express.Router();

// Strictly locked down to system administrators only
router.use(auth, rbac('r1'));

router.route('/')
    .get(controller.getRoles)
    .post(controller.createRole);

router.route('/:id')
    .get(controller.getRoleById)
    .put(controller.updateRole)
    .delete(controller.deleteRole);

export default router;