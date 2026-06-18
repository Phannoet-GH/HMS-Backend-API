import * as invoiceService from '../services/invoice.service.js';
import response from '../utils/response.js';

// ➕ CREATE INVOICE
export const createInvoice = async (req, res, next) => {
  try {
    // req.user.id tracks which clerk or automated system initialized this bill
    const invoice = await invoiceService.createInvoice(req.body, req.user.id);
    response.created(res, invoice, 'Financial invoice initialized successfully');
  } catch (error) {
    next(error);
  }
};

// 📋 GET ALL INVOICES (With pagination metadata handling)
export const getInvoices = async (req, res, next) => {
  try {
    const { data, total } = await invoiceService.getInvoices(req.query);
    response.ok(res, {
      invoices: data,
      total,
    });
  } catch (error) {
    next(error);
  }
};

// 🔍 GET BY ID
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    response.ok(res, invoice);
  } catch (error) {
    next(error);
  }
};

// 💳 UPDATE STATUS (Processes payments like cash, card, or QR-code)
export const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status, paymentMethod, transactionRef } = req.body;

    if (!status) {
      // Clean, immediate validation interception using your standard response layer
      return response.badRequest(res, 'Invoice transition status state is required');
    }

    // Explicitly package transaction parameters to clean up your service layer inputs
    const statusPayload = {
      paymentMethod: paymentMethod || 'cash',
      transactionRef: transactionRef || ''
    };

    const invoice = await invoiceService.updateInvoiceStatus(
      req.params.id,
      status,
      statusPayload
    );

    response.ok(res, invoice, `Invoice successfully transitioned to status: ${status}`);
  } catch (error) {
    next(error);
  }
};

// ✏️ UPDATE INVOICE DETAILS
export const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
    response.ok(res, invoice, 'Invoice lineup details updated successfully');
  } catch (error) {
    next(error);
  }
};

// ❌ PURGE INVOICE (Typically reserved for high-level admins)
export const deleteInvoice = async (req, res, next) => {
  try {
    await invoiceService.deleteInvoice(req.params.id);
    response.ok(res, null, 'Invoice statement purged successfully from active registry');
  } catch (error) {
    next(error);
  }
};