import express from 'express';
const router = express.Router();

import * as invoiceController from '../controllers/invoice.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

// 📋 Staff roles allowed to interact with invoicing (r1: Admin, r2: Manager, r4: Front Desk)
const authorizedFinanceStaff = ['r1', 'r2', 'r4', 'r5'];

router.route('/')
    .get(auth, rbac(...authorizedFinanceStaff), invoiceController.getInvoices)
    .post(auth, rbac(...authorizedFinanceStaff), invoiceController.createInvoice);

router.route('/:id')
    .get(auth, rbac(...authorizedFinanceStaff), invoiceController.getInvoiceById)
    .patch(auth, rbac(...authorizedFinanceStaff), invoiceController.updateInvoice);

// 🎯 Specialized Payment Processing Endpoint
router.put('/:id/status', auth, rbac(...authorizedFinanceStaff), invoiceController.updateInvoiceStatus);

// ❌ Strict Destructive Action: Only highest administrative tiers can drop a bill record
router.delete('/:id', auth, rbac('r1', 'r2'), invoiceController.deleteInvoice);

export default router;