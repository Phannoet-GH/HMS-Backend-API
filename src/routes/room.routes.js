// 1. Use import instead of require (Add .js extensions!)
import express from 'express';
const router = express.Router();

import * as roomController from '../controllers/room.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

router.get('/', auth, roomController.getRooms);
router.get('/:id', auth, roomController.getRoomById);
router.post('/', auth, rbac('r1'), roomController.createRoom);
router.patch('/:id', auth, rbac('r1'), roomController.updateRoom);
router.delete('/:id', auth, rbac('r1'), roomController.deleteRoom);

// 2. Use export default instead of module.exports
export default router;