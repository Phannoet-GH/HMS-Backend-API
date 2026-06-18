import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  // 🏢 Floor placement (Useful for grouping rooms on your Angular dashboard grid layout)
  floorNumber: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  type: {
    type: String,
    required: true,
    enum: ['single', 'double', 'suite', 'deluxe']
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  // 🛏️ Expanded to support crucial housekeeping turnaround lifecycles
  status: {
    type: String,
    enum: [
      'available',    // Clean and ready for check-in
      'occupied',     // Guest is currently living in the room
      'reserved',     // Blocked for an upcoming arrival today
      'dirty',        // Guest checked out, needs cleaning attention 🧹
      'cleaning',     // Housekeeping staff is currently inside cleaning 🧼
      'maintenance'   // Broken utility, out-of-order 🛠️
    ],
    default: 'available'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

// 🚀 Core Operational Search Performance Indexes
roomSchema.index({ status: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ floorNumber: 1 }); // Fast sorting when showing the hotel floor plan view

export default mongoose.model('Room', roomSchema);