import express from 'express';
const router = express.Router();

import * as roomController from '../controllers/room.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

// 📋 Roles authorized to view/interact with rooms (r1: Admin, r2: Manager, r4: Front Desk / Housekeeping)
const authorizedRoomStaff = ['r1', 'r2', 'r3', 'r4'];

router.route('/')
    .get(auth, rbac(...authorizedRoomStaff), roomController.getRooms)
    // 🔒 Creating units is restricted to higher management levels
    .post(auth, rbac('r1', 'r2'), roomController.createRoom);

router.route('/:id')
    .get(auth, rbac(...authorizedRoomStaff), roomController.getRoomById)
    .put(auth, rbac(...authorizedRoomStaff), roomController.updateRoom)
    .patch(auth, rbac(...authorizedRoomStaff), roomController.updateRoom)
    // ❌ Dropping physical inventory is restricted strictly to Admins and Managers
    .delete(auth, rbac('r1', 'r2'), roomController.deleteRoom);

export default router;