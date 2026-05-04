const Invoice = require('../models/invoice.model');
const Booking = require('../models/booking.model');
const response = require('../utils/response');

exports.createInvoice = async (req, res, next) => {
  try {
    const { bookingId, numberOfNights, roomCharges, additionalCharges = [], discount = 0, taxPercentage = 0, notes } = req.body;

    // Get booking details
    const booking = await Booking.findById(bookingId).populate('guest room');
    if (!booking) {
      return response.notFound(res, 'Booking not found');
    }

    // Calculate amounts
    let subtotal = roomCharges;
    let additionalTotal = 0;

    if (additionalCharges && additionalCharges.length > 0) {
      additionalTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
      subtotal += additionalTotal;
    }

    const discountAmount = (subtotal * discount) / 100 || 0;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * taxPercentage) / 100 || 0;
    const totalAmount = taxableAmount + taxAmount;

    const invoice = new Invoice({
      invoiceNumber: `INV-${Date.now()}`,
      booking: bookingId,
      guest: {
        fullName: booking.guest.fullName,
        email: booking.guest.email,
        phone: booking.guest.phone,
        address: booking.guest.address
      },
      room: {
        roomNumber: booking.room.roomNumber,
        type: booking.room.type,
        pricePerNight: booking.room.pricePerNight
      },
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      numberOfNights,
      roomCharges,
      additionalCharges,
      subtotal,
      discount: discountAmount,
      taxPercentage,
      taxAmount,
      totalAmount,
      amount: totalAmount,
      status: 'draft',
      notes,
      createdBy: req.user.id
    });

    await invoice.save();
    response.created(res, invoice, 'Invoice created successfully');
  } catch (error) {
    next(error);
  }
};

exports.getInvoices = async (req, res, next) => {
  try {
    const { status, bookingId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (bookingId) filter.booking = bookingId;

    const invoices = await Invoice.find(filter)
      .populate('booking')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    response.ok(res, invoices);
  } catch (error) {
    next(error);
  }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('booking')
      .populate('createdBy', 'fullName email');

    if (!invoice) {
      return response.notFound(res, 'Invoice not found');
    }

    response.ok(res, invoice);
  } catch (error) {
    next(error);
  }
};

exports.updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status, paymentDate, paymentMethod } = req.body;
    const updateData = { status };

    if (paymentDate) updateData.paymentDate = paymentDate;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!invoice) {
      return response.notFound(res, 'Invoice not found');
    }

    response.ok(res, invoice, 'Invoice updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.updateInvoice = async (req, res, next) => {
  try {
    const { additionalCharges, discount, taxPercentage, notes } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return response.notFound(res, 'Invoice not found');
    }

    if (invoice.status !== 'draft') {
      return response.badRequest(res, 'Can only edit draft invoices');
    }

    // Recalculate amounts if needed
    let subtotal = invoice.roomCharges;
    if (additionalCharges && additionalCharges.length > 0) {
      const additionalTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
      subtotal += additionalTotal;
      invoice.additionalCharges = additionalCharges;
    }

    const discountAmount = (subtotal * discount) / 100 || 0;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * taxPercentage) / 100 || 0;
    const totalAmount = taxableAmount + taxAmount;

    invoice.subtotal = subtotal;
    invoice.discount = discountAmount;
    invoice.taxPercentage = taxPercentage || 0;
    invoice.taxAmount = taxAmount;
    invoice.totalAmount = totalAmount;
    invoice.amount = totalAmount;
    invoice.notes = notes;

    await invoice.save();
    response.ok(res, invoice, 'Invoice updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return response.notFound(res, 'Invoice not found');
    }

    if (invoice.status !== 'draft') {
      return response.badRequest(res, 'Can only delete draft invoices');
    }

    await Invoice.findByIdAndDelete(req.params.id);
    response.ok(res, null, 'Invoice deleted successfully');
  } catch (error) {
    next(error);
  }
};
