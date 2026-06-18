import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Stock Keeping Unit (e.g., "HK-SAMP-001" for Housekeeping Shampoo)
    sku: {
        type: String,
        unique: true, // 🟢 Added: Ensures no duplicate SKUs exist in the hotel warehouse
        trim: true,
        sparse: true   // Allows null/empty fields to stay unique without breaking
    },
    // 🏷️ Category enum matching the procurement classifications of your hotel system
    category: {
        type: String,
        required: true,
        trim: true,
        enum: [
            'f&b',                  // Food & Beverage ingredients/supplies
            'linen-textiles',       // Bed sheets, towels, pillowcases
            'guest-amenities',      // Shampoos, dental kits, mini-bar snacks
            'maintenance-repaired', // Lightbulbs, plumbing spare parts, engineering tools
            'cleaning-janitorial',  // Industrial detergents, bleach, garbage bags
            'office-it'             // Keycards, printer ink, front-desk receipt paper
        ]
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    // 🚨 The threshold line: When quantity drops below or matches this number, status becomes 'low-stock'
    reorderLevel: {
        type: Number,
        default: 5,
        min: 0
    },
    unitCost: {
        type: Number,
        default: 0,
        min: 0
    },
    // 🤝 Relational Link: Connects explicitly to your Supplier collection
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        default: null
    },
    status: {
        type: String,
        enum: ['in-stock', 'low-stock', 'out-of-stock'],
        default: 'in-stock'
    }
}, { timestamps: true });

// 🧮 Auto-Calculate Stock Status Thresholds Right Before Saving
inventoryItemSchema.pre('save', function (next) {
    if (this.quantity === 0) {
        this.status = 'out-of-stock';
    } else if (this.quantity <= this.reorderLevel) {
        this.status = 'low-stock';
    } else {
        this.status = 'in-stock';
    }
    next();
});

// 🚀 Core Database Query Performance Indexes
inventoryItemSchema.index({ sku: 1 });
inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ status: 1 });
inventoryItemSchema.index({ supplierId: 1 });

export default mongoose.model('InventoryItem', inventoryItemSchema);