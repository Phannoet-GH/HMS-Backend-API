const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Create a new invoice
router.post('/', invoiceController.createInvoice);

// Get all invoices
router.get('/', invoiceController.getInvoices);

// Get invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// Update invoice status (mark as paid, issued, cancelled)
router.patch('/:id/status', invoiceController.updateInvoiceStatus);

// Update invoice details (only for draft invoices)
router.put('/:id', invoiceController.updateInvoice);

// Delete invoice (only for draft invoices)
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;
