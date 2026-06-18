import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    contactName: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    // 🏷️ Hotel Procurement Category Types
    category: {
        type: String,
        required: true,
        trim: true,
        enum: [
            'f&b',                  // Food & Beverage supplies
            'linen-textiles',       // Sheets, towels, uniforms
            'guest-amenities',      // Shampoos, soaps, slippers
            'maintenance-repaired', // Engineering parts, bulbs, tools
            'cleaning-janitorial',  // Disinfectants, laundry detergents
            'office-it'             // Keycards, paper, tech accessories
        ],
        default: 'guest-amenities'
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

// 🚀 Performance Query Indexes
// Fast lookups when filtering your vendor list by business type or active status
supplierSchema.index({ category: 1 });
supplierSchema.index({ status: 1 });

// 🟢 FIXED: Checks if the model exists first; falls back to compiling it if it doesn't
const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);
export default Supplier;