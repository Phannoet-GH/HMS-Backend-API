import express from 'express';
import * as controller from '../controllers/inventory.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

const router = express.Router();
router.use(auth);

router.route('/')
    .get(controller.getInventoryItems)
    .post(rbac('r1', 'r2'), controller.createInventoryItem);

router.route('/:id')
    .get(controller.getInventoryItemById)
    .put(rbac('r1', 'r2'), controller.updateInventoryItem)
    .delete(rbac('r1'), controller.deleteInventoryItem);

export default router;