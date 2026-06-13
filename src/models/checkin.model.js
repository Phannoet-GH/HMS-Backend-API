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
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Employee reference is required']
    },
    actualCheckInTime: {
        type: Date,
        default: Date.now
    },
    keyIssued: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true });

checkInSchema.index({ bookingId: 1 });
checkInSchema.index({ roomId: 1 });
checkInSchema.index({ status: 1 });

export default mongoose.model('CheckIn', checkInSchema);