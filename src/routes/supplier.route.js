import express from 'express';
import * as controller from '../controllers/supplier.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

const router = express.Router();
router.use(auth);

router.route('/')
    .get(controller.getSuppliers)
    .post(rbac('r1', 'r2'), controller.createSupplier);

router.route('/:id')
    .get(controller.getSupplierById)
    .put(rbac('r1', 'r2'), controller.updateSupplier)
    .delete(rbac('r1'), controller.deleteSupplier);

export default router;