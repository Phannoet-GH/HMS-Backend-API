import mongoose from 'mongoose';

const invoiceGuestSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  address: String,
  idNumber: String
}, { _id: false });

const invoiceRoomSchema = new mongoose.Schema({
  roomNumber: String,
  type: String,
  pricePerNight: Number
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  guest: invoiceGuestSchema,
  room: invoiceRoomSchema,
  checkInDate: Date,
  checkOutDate: Date,
  numberOfNights: {
    type: Number,
    required: true
  },
  roomCharges: {
    type: Number,
    required: true
  },
  additionalCharges: [
    {
      description: String,
      amount: Number,
      _id: false
    }
  ],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  taxPercentage: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'issued', 'unpaid', 'paid', 'cancelled', 'void'],
    default: 'draft'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: Date,
  paymentDate: Date,
  paymentMethod: String,
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Auto-generate invoice number
invoiceSchema.pre('save', async function () {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
});
export default mongoose.model('Invoice', invoiceSchema);
