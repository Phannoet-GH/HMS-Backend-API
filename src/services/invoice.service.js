import Invoice from '../models/invoice.model.js';
import Booking from '../models/booking.model.js';

/**
 * ➕ Initializes a brand new billing invoice snapshot from an active reservation log.
 */
export const createInvoice = async (data, userId) => {
  const {
    bookingId,
    numberOfNights,
    roomCharges,
    additionalCharges = [],
    discount = 0, // Inputted as a percentage (e.g. 10 for 10%)
    taxPercentage = 0,
    notes
  } = data;

  // Populating using the corrected model field parameters: guestId and roomId
  const booking = await Booking.findById(bookingId).populate('guestId roomId');
  if (!booking) {
    const error = new Error('Target reservation booking ledger entry not found');
    error.statusCode = 404;
    throw error;
  }

  if (!booking.guestId || !booking.roomId) {
    const error = new Error('Booking profile is missing critical relational guest or room document hooks');
    error.statusCode = 409;
    throw error;
  }

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
    // Creating an isolated snapshot of the guest profile data at check-out time
    guest: {
      fullName: booking.guestId.fullName,
      email: booking.guestId.email,
      phone: booking.guestId.phone,
      address: booking.guestId.address
    },
    // Creating an isolated snapshot of the room parameters at check-out time
    room: {
      roomNumber: booking.roomId.roomNumber,
      type: booking.roomId.type,
      pricePerNight: booking.roomId.pricePerNight
    },
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    numberOfNights,
    roomCharges,
    additionalCharges,
    subtotal,
    discount: discountAmount, // Saved safely as absolute calculated fiat cash value
    taxPercentage,
    taxAmount,
    totalAmount,
    amount: totalAmount,
    status: 'draft',
    notes,
    createdBy: userId
  });

  await invoice.save();

  return await Invoice.findById(invoice._id)
    .populate('booking')
    .populate('createdBy', '-password');
};

/**
 * 📋 Pulls invoices records using dynamic matching flags and pagination offsets.
 */
export const getInvoices = async (filters = {}) => {
  const { status, bookingId, skip = 0, limit = 10 } = filters;
  const query = {};

  if (status) query.status = status;
  if (bookingId) query.booking = bookingId;

  const invoices = await Invoice.find(query)
    .populate('booking')
    .populate('createdBy', 'username email')
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit));

  const total = await Invoice.countDocuments(query);

  return { data: invoices, total };
};

/**
 * 🔍 Pulls an individual invoice file by its Object ID.
 */
export const getInvoiceById = async (id) => {
  const invoice = await Invoice.findById(id)
    .populate('booking')
    .populate('createdBy', 'username email');

  if (!invoice) {
    const error = new Error('Invoice file profile not found');
    error.statusCode = 404;
    throw error;
  }

  return invoice;
};

/**
 * 🔄 Transitions operational statuses (e.g. tracking payment logs).
 */
export const updateInvoiceStatus = async (id, status, data = {}) => {
  const validStatuses = ['draft', 'issued', 'unpaid', 'paid', 'cancelled', 'void'];

  if (!validStatuses.includes(status)) {
    const error = new Error(`Invalid status transition parameter. Allowed values: ${validStatuses.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const invoice = await Invoice.findByIdAndUpdate(
    id,
    {
      status,
      ...(status === 'paid' && { paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date() }),
      ...(data.paymentMethod && { paymentMethod: data.paymentMethod })
    },
    { new: true, runValidators: true }
  ).populate('booking').populate('createdBy', 'username email');

  if (!invoice) {
    const error = new Error('Invoice file profile not found');
    error.statusCode = 404;
    throw error;
  }

  return invoice;
};

/**
 * ✏️ Modifies baseline itemizations and handles live financial recalculations.
 */
export const updateInvoice = async (id, data) => {
  const allowedFields = ['numberOfNights', 'roomCharges', 'additionalCharges', 'discount', 'taxPercentage', 'notes', 'dueDate', 'paymentMethod'];

  const updateData = {};
  allowedFields.forEach(field => {
    if (field in data) {
      updateData[field] = data[field];
    }
  });

  // 🧮 Live financial math recalculation pipeline execution
  if (
    updateData.roomCharges !== undefined ||
    updateData.additionalCharges !== undefined ||
    updateData.discount !== undefined ||
    updateData.taxPercentage !== undefined
  ) {
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      const error = new Error('Invoice file profile not found');
      error.statusCode = 404;
      throw error;
    }

    let subtotal = updateData.roomCharges !== undefined ? updateData.roomCharges : invoice.roomCharges;
    const additionalCharges = updateData.additionalCharges !== undefined ? updateData.additionalCharges : invoice.additionalCharges;

    if (additionalCharges && additionalCharges.length > 0) {
      const additionalTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
      subtotal += additionalTotal;
    }

    // 🟢 Bugfix: If discount is modified, compute it using the newly passed percentage value.
    // If it's not being modified, reverse-engineer the original percentage from the saved subtotal.
    let discountPercent = 0;
    if (updateData.discount !== undefined) {
      discountPercent = updateData.discount;
    } else if (invoice.subtotal > 0) {
      discountPercent = (invoice.discount * 100) / invoice.subtotal;
    }

    const taxPercentage = updateData.taxPercentage !== undefined ? updateData.taxPercentage : invoice.taxPercentage;

    const discountAmount = (subtotal * discountPercent) / 100 || 0;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * taxPercentage) / 100 || 0;
    const totalAmount = taxableAmount + taxAmount;

    updateData.subtotal = subtotal;
    updateData.discount = discountAmount; // Overwrites database value safely with flat cash amount
    updateData.taxAmount = taxAmount;
    updateData.totalAmount = totalAmount;
    updateData.amount = totalAmount;
  }

  const invoice = await Invoice.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('booking').populate('createdBy', 'username email');

  if (!invoice) {
    const error = new Error('Invoice file profile not found');
    error.statusCode = 404;
    throw error;
  }

  return invoice;
};

/**
 * ❌ Deletes an invoice file registry profile completely.
 */
export const deleteInvoice = async (id) => {
  const invoice = await Invoice.findByIdAndDelete(id);

  if (!invoice) {
    const error = new Error('Invoice file profile not found');
    error.statusCode = 404;
    throw error;
  }

  return invoice;
};

export default {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  updateInvoice,
  deleteInvoice
};