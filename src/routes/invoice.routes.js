// 1. Swap 'require' for 'import'
import express from 'express';
// 2. IMPORTANT: You must include the '.js' extension in ESM
import * as invoiceController from '../controllers/invoice.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

const router = express.Router();

// All routes require authentication
// Note: Ensure authMiddleware.js uses 'export default' for this syntax
router.use(authMiddleware);

// Create a new invoice
router.post('/', rbac('r1', 'r5'), invoiceController.createInvoice);

// Get all invoices
router.get('/', rbac('r1', 'r4', 'r5'), invoiceController.getInvoices);

// Get invoice by ID
router.get('/:id', rbac('r1', 'r4', 'r5'), invoiceController.getInvoiceById);

// Update invoice status
router.patch('/:id/status', rbac('r1', 'r5'), invoiceController.updateInvoiceStatus);

// Update invoice details
router.put('/:id', rbac('r1', 'r5'), invoiceController.updateInvoice);

// Delete invoice
router.delete('/:id', rbac('r1', 'r5'), invoiceController.deleteInvoice);

// 3. Swap 'module.exports' for 'export default'
export default router;