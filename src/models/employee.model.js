import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Department is required']
    },
    position: {
        type: String,
        trim: true,
        default: ''
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    shift: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night'],
        default: 'morning'
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'off-duty', 'on-leave', 'terminated'],
        default: 'active'
    }
}, { timestamps: true });

employeeSchema.index({ status: 1 });
employeeSchema.index({ departmentId: 1 });
employeeSchema.index({ managerId: 1 });
const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
export default Employee;