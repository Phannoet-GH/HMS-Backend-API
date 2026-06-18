import express from 'express';
import * as controller from '../controllers/room-service.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

const router = express.Router();
const staffRoles = ['r1', 'r2', 'r3', 'r4'];

router.use(auth);

router.route('/')
    .get(rbac(...staffRoles), controller.getRoomServiceOrders)
    .post(rbac(...staffRoles), controller.createRoomServiceOrder);

router.route('/:id')
    .get(rbac(...staffRoles), controller.getRoomServiceOrderById)
    .put(rbac(...staffRoles), controller.updateRoomServiceOrder)
    .delete(rbac('r1', 'r2'), controller.deleteRoomServiceOrder);

export default router;