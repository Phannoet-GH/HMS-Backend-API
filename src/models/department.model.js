import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, uppercase: true },
    budget: { type: Number, default: 0 },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    status: { type: String, default: 'active' }
}, {
    timestamps: true,
    strict: false // Bypasses application-level strict filters
});

if (mongoose.models.Department) {
    delete mongoose.models.Department;
}

const Department = mongoose.model('Department', departmentSchema);
export default Department;