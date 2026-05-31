import * as invoiceService from '../services/invoice.service.js';
import response from '../utils/response.js';

// CREATE
export const createInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.createInvoice(
      req.body,
      req.user.id
    );

    response.created(res, invoice, 'Invoice created successfully');
  } catch (error) {
    next(error);
  }
};

// GET ALL
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

// GET BY ID
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);

    response.ok(res, invoice);
  } catch (error) {
    next(error);
  }
};

// UPDATE STATUS
export const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return response.badRequest(res, 'Status is required');
    }

    const invoice = await invoiceService.updateInvoiceStatus(
      req.params.id,
      status,
      req.body
    );

    response.ok(res, invoice, 'Invoice status updated successfully');
  } catch (error) {
    next(error);
  }
};

// UPDATE INVOICE
export const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.updateInvoice(
      req.params.id,
      req.body
    );

    response.ok(res, invoice, 'Invoice updated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE INVOICE
export const deleteInvoice = async (req, res, next) => {
  try {
    await invoiceService.deleteInvoice(req.params.id);

    response.ok(res, null, 'Invoice deleted successfully');
  } catch (error) {
    next(error);
  }
};
