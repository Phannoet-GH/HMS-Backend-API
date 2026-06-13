import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: ['Housekeeping', 'Front Desk', 'Food & Beverage', 'Maintenance', 'Security', 'Management'],
        trim: true
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        trim: true
    },
    shift: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night'],
        required: [true, 'Shift is required']
    },
    phone: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'off-duty', 'on-leave', 'terminated'],
        default: 'active'
    }
}, { timestamps: true });

employeeSchema.index({ status: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ shift: 1 });

export default mongoose.model('Employee', employeeSchema);