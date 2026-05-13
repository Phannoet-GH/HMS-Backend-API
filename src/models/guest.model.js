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
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  idNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  }
}, { timestamps: true });
export default mongoose.model('Guest', guestSchema);
