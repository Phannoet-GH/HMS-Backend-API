import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  // 🪪 Identity Verification
  idType: {
    type: String,
    enum: ['passport', 'national-id', 'driver-license', 'other'],
    default: 'national-id'
  },
  idNumber: {
    type: String,
    trim: true,
    default: '' // Keeps it flexible for phone-only quick bookings
  },
  nationality: {
    type: String,
    trim: true,
    default: 'Cambodian' // Sets a local fallback default to speed up front desk check-in
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  // 💡 Marketing & Loyalty Data Points (Optional but useful for hotel CRM)
  notes: {
    type: String,
    trim: true,
    default: '' // For guest preferences like "Allergies to nuts", "Prefers high floors"
  }
}, { timestamps: true });

// 🚀 Database Performance & Lookup Indexes
guestSchema.index({ fullName: 1 });
guestSchema.index({ phone: 1 });    // Fast lookup when a guest calls to verify or cancel their booking
guestSchema.index({ idNumber: 1 }); // Fast lookup for checking in repeating guests
// 🚀 Add this with your other indexes at the bottom
guestSchema.index({ email: 1 }); // Fast lookups for family or corporate group accounts

export default mongoose.model('Guest', guestSchema);