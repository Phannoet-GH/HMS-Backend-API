// 1. Swap 'require' for 'import'
import express from 'express';
// 2. IMPORTANT: You must include the '.js' extension in ESM
import * as invoiceController from '../controllers/invoice.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
// Note: Ensure authMiddleware.js uses 'export default' for this syntax
router.use(authMiddleware);

// Create a new invoice
router.post('/', invoiceController.createInvoice);

// Get all invoices
router.get('/', invoiceController.getInvoices);

// Get invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// Update invoice status
router.patch('/:id/status', invoiceController.updateInvoiceStatus);

// Update invoice details
router.put('/:id', invoiceController.updateInvoice);

// Delete invoice
router.delete('/:id', invoiceController.deleteInvoice);

// 3. Swap 'module.exports' for 'export default'
export default router;