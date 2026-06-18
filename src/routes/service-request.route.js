import express from 'express';
import * as controller from '../controllers/service-request.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

const router = express.Router();
const staffRoles = ['r1', 'r2', 'r4']; // Admin, Manager, FrontDesk/Housekeeping

router.use(auth);

router.route('/')
    .get(rbac(...staffRoles), controller.getServiceRequests)
    .post(rbac(...staffRoles), controller.createServiceRequest);

router.route('/:id')
    .get(rbac(...staffRoles), controller.getServiceRequestById)
    .put(rbac(...staffRoles), controller.updateServiceRequest)
    .delete(rbac('r1', 'r2'), controller.deleteServiceRequest);

export default router;