import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  guestId: { // 🟢 Fixed naming consistency to match your other relational schema models
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true
  },
  roomId: {  // 🟢 Fixed naming consistency
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  numberOfNights: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'], // Changed underscores to clean hyphens to match your system guidelines
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  // 🕒 Actual Operational Timestamps
  actualCheckIn: {
    type: Date,
    default: null
  },
  actualCheckOut: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// 🧮 Auto-Calculate Nights Right Before Validating
// booking.model.js
bookingSchema.pre('save', async function () {
  // If this booking is being updated, perform calculations
  if (this.isModified('checkInDate') || this.isModified('checkOutDate')) {
    const timeDiff = this.checkOutDate.getTime() - this.checkInDate.getTime();
    const calculatedNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    this.numberOfNights = Math.max(1, calculatedNights);
  }
  // Mongoose automatically waits for this async function to resolve.
  // NO 'next' call needed here.
});

// 🚀 Core Operational Performance Indexes
bookingSchema.index({ guestId: 1 });
bookingSchema.index({ roomId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 }); // Essential for filtering room availability maps

export default mongoose.model('Booking', bookingSchema);