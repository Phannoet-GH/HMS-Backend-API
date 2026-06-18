import mongoose from 'mongoose';

const invoiceGuestSchema = new mongoose.Schema({
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  idNumber: { type: String, trim: true } // Passport or National ID
}, { _id: false });

const invoiceRoomSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  roomNumber: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  pricePerNight: { type: Number, required: true, min: 0 }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  guest: invoiceGuestSchema,
  room: invoiceRoomSchema,
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  numberOfNights: {
    type: Number,
    required: true,
    min: 1
  },
  roomCharges: {
    type: Number,
    required: true,
    default: 0
  },
  additionalCharges: [
    {
      // 🍔 Optional link to RoomServiceOrders, MiniBar, or ServiceRequest tickets
      sourceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'additionalCharges.sourceModel', default: null },
      sourceModel: { type: String, enum: ['RoomServiceOrder', 'ServiceRequest', 'CustomCharge'], default: 'CustomCharge' },
      description: { type: String, required: true, trim: true },
      amount: { type: Number, required: true, min: 0 }
    }
  ],
  subtotal: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0, min: 0 },
  taxPercentage: { type: Number, default: 0, min: 0 }, // e.g., 10 for 10% VAT
  taxAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'issued', 'unpaid', 'paid', 'cancelled', 'void'],
    default: 'draft'
  },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  paymentDate: { type: Date, default: null },
  paymentMethod: { type: String, enum: ['cash', 'card', 'bank-transfer', 'qr-code', 'none'], default: 'none' },
  notes: { type: String, trim: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// 🚀 Safe Auto-Generation & Financial Calculation Hook
invoiceSchema.pre('validate', async function () {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `INV-${year}${month}-`;

  // 1. Safe Invoice Number Generation (Solves the unique constraint bug)
  if (!this.invoiceNumber) {
    const lastInvoice = await this.constructor.findOne(
      { invoiceNumber: new RegExp(`^${prefix}`) },
      { invoiceNumber: 1 },
      { sort: { invoiceNumber: -1 } }
    );

    let nextSerial = 1;
    if (lastInvoice) {
      const lastSerialStr = lastInvoice.invoiceNumber.split('-')[2];
      nextSerial = parseInt(lastSerialStr, 10) + 1;
    }
    this.invoiceNumber = `${prefix}${String(nextSerial).padStart(5, '0')}`;
  }

  // 2. Automated Financial Logic Calculations
  if (this.room && this.room.pricePerNight && this.numberOfNights) {
    this.roomCharges = this.room.pricePerNight * this.numberOfNights;
  }

  const extraSum = (this.additionalCharges || []).reduce((sum, item) => sum + item.amount, 0);

  this.subtotal = this.roomCharges + extraSum;

  // Apply discount safely
  const netSubtotal = Math.max(0, this.subtotal - this.discount);

  // Calculate taxes accurately
  this.taxAmount = parseFloat(((netSubtotal * (this.taxPercentage || 0)) / 100).toFixed(2));
  this.totalAmount = parseFloat((netSubtotal + this.taxAmount).toFixed(2));
});

// 🚀 Core Financial Transaction Indexes
invoiceSchema.index({ bookingId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ issueDate: -1 });

export default mongoose.model('Invoice', invoiceSchema);