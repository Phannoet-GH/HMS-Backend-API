import express from 'express';
import * as controller from '../controllers/purchase-order.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

const router = express.Router();
router.use(auth);

router.route('/')
    .get(rbac('r1', 'r2'), controller.getPurchaseOrders)
    .post(rbac('r1', 'r2'), controller.createPurchaseOrder);

router.route('/:id')
    .get(rbac('r1', 'r2'), controller.getPurchaseOrderById)
    .put(rbac('r1', 'r2'), controller.updatePurchaseOrder)
    .delete(rbac('r1'), controller.deletePurchaseOrder);

export default router;