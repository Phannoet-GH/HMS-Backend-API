import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking reference is required']
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, 'Room reference is required']
    },
    // 👤 Binds this transaction to the front-desk employee currently logged in
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Employee reference is required']
    },
    actualCheckInTime: {
        type: Date,
        default: Date.now,
        required: true
    },
    keyIssued: {
        type: Boolean,
        default: false
    },
    // 💳 Security Deposit: Vital for incidentals like mini-bar or room damages
    depositAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'bank-transfer', 'qr-code', 'none'],
        default: 'none'
    },
    // 🧳 Bellhop Tracker: Number of bags stored or delivered to the room
    baggageCount: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['completed', 'cancelled'], // Removed 'pending' because creating this log means the action happened!
        default: 'completed'
    },
    notes: {
        type: String,
        trim: true,
        default: '' // E.g., "Guest requested late check-out option"
    }
}, { timestamps: true });

// 🚀 Query Optimization Indexes
checkInSchema.index({ bookingId: 1 });
checkInSchema.index({ roomId: 1 });
checkInSchema.index({ status: 1 });
checkInSchema.index({ actualCheckInTime: -1 }); // Fast sorting for daily reception desk report sheets

export default mongoose.model('CheckIn', checkInSchema);