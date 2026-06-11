// 1. Use import instead of require (Add .js extensions!)
import express from 'express';
const router = express.Router();

import * as roomController from '../controllers/room.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

const roomManagerRoles = ['r1', 'r2'];

router.get('/', auth, roomController.getRooms);
router.get('/:id', auth, roomController.getRoomById);
router.post('/', auth, rbac(...roomManagerRoles), roomController.createRoom);
router.patch('/:id', auth, rbac(...roomManagerRoles), roomController.updateRoom);
router.delete('/:id', auth, rbac(...roomManagerRoles), roomController.deleteRoom);

// 2. Use export default instead of module.exports
export default router;
