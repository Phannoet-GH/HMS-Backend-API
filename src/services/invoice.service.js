import Invoice from '../models/invoice.model.js';
import Booking from '../models/booking.model.js';

export const createInvoice = async (data, userId) => {
  const { bookingId, numberOfNights, roomCharges, additionalCharges = [], discount = 0, taxPercentage = 0, notes } = data;

  const booking = await Booking.findById(bookingId).populate('guest room');
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (!booking.guest || !booking.room) {
    const error = new Error('Booking is missing guest or room data');
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
    createdBy: userId
  });

  await invoice.save();
  return invoice.populate('booking').populate('createdBy', '-password');
};

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

export const getInvoiceById = async (id) => {
  const invoice = await Invoice.findById(id)
    .populate('booking')
    .populate('createdBy', 'username email');

  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }

  return invoice;
};

export const updateInvoiceStatus = async (id, status, data = {}) => {
  const validStatuses = ['draft', 'issued', 'unpaid', 'paid', 'cancelled', 'void'];

  if (!validStatuses.includes(status)) {
    const error = new Error(`Invalid status. Valid statuses are: ${validStatuses.join(', ')}`);
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
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }

  return invoice;
};

export const updateInvoice = async (id, data) => {
  const allowedFields = ['numberOfNights', 'roomCharges', 'additionalCharges', 'discount', 'taxPercentage', 'notes', 'dueDate', 'paymentMethod'];
  
  const updateData = {};
  allowedFields.forEach(field => {
    if (field in data) {
      updateData[field] = data[field];
    }
  });

  // Recalculate totals if relevant fields changed
  if (updateData.roomCharges !== undefined || updateData.additionalCharges !== undefined || updateData.discount !== undefined || updateData.taxPercentage !== undefined) {
    const invoice = await Invoice.findById(id);
    
    let subtotal = updateData.roomCharges !== undefined ? updateData.roomCharges : invoice.roomCharges;
    const additionalCharges = updateData.additionalCharges !== undefined ? updateData.additionalCharges : invoice.additionalCharges;
    
    if (additionalCharges && additionalCharges.length > 0) {
      const additionalTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
      subtotal += additionalTotal;
    }

    const discount = updateData.discount !== undefined ? updateData.discount : invoice.discount;
    const taxPercentage = updateData.taxPercentage !== undefined ? updateData.taxPercentage : invoice.taxPercentage;
    
    const discountAmount = (subtotal * discount) / 100 || 0;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * taxPercentage) / 100 || 0;
    const totalAmount = taxableAmount + taxAmount;

    updateData.subtotal = subtotal;
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
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }

  return invoice;
};

export const deleteInvoice = async (id) => {
  const invoice = await Invoice.findByIdAndDelete(id);

  if (!invoice) {
    const error = new Error('Invoice not found');
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
