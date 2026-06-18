import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
    // 🛏️ Relational Link: Binds the ticket to the actual Room document instance
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    // Mirror string: Retained for quick rendering across tabular frontend grids
    roomNumber: {
        type: String,
        required: true,
        trim: true
    },
    // 🧹 Clean Category Enum: Standardized list of hotel service tasks
    type: {
        type: String,
        required: true,
        trim: true,
        enum: [
            'housekeeping',     // Extra towels, room cleaning, pillows
            'maintenance',      // Broken AC, plumbing issues, TV setups
            'room-service',     // Food and beverage delivery
            'luggage',          // Bellhop assistance requests
            'wake-up-call',     // Morning wake up requests
            'other'
        ],
        default: 'housekeeping'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    // 👤 Relational Link: Binds this task explicitly to an employee staff profile
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'cancelled'],
        default: 'open'
    }
}, { timestamps: true });

// 🚀 Performance Query Indexes
// Service requests are queried constantly on dashboards, optimize with explicit indexes:
serviceRequestSchema.index({ roomId: 1 }); // 🚀 Added: Fast indexing for searching requests by room
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ priority: 1 });
serviceRequestSchema.index({ assignedTo: 1 });
serviceRequestSchema.index({ roomNumber: 1 });

// 🟢 FIXED: Safe registry lookup that stops OverwriteModelErrors on hot-reloads
const ServiceRequest = mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', serviceRequestSchema);
export default ServiceRequest;