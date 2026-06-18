import mongoose from 'mongoose';

const purchaseOrderItemSchema = new mongoose.Schema({
    // 📦 Relational Link: Direct reference to a specific item in your inventory collection
    inventoryItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true
    },
    // Captured string name copy to protect historical receipts if inventory gets wiped
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1.'],
        default: 1
    },
    unitCost: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const purchaseOrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true, // 🟢 Added: Prevents duplicate PO invoices from registering
        trim: true
    },
    // 🤝 Relational Link: Direct pointer to your Supplier collection
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    // 🧺 Structured Basket Array
    items: [purchaseOrderItemSchema],

    totalAmount: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    expectedDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'ordered', 'received', 'cancelled'],
        default: 'draft'
    }
}, { timestamps: true });

// 🧮 Pre-Save Automation: Multiplies quantity * unitCost for the total PO amount
purchaseOrderSchema.pre('save', function (next) {
    if (this.items && this.items.length > 0) {
        this.totalAmount = this.items.reduce((sum, item) => {
            return sum + (item.quantity * item.unitCost);
        }, 0);
    }
    next();
});

// 🚀 Performance Query Indexes
purchaseOrderSchema.index({ orderNumber: 1 });
purchaseOrderSchema.index({ supplierId: 1 });
purchaseOrderSchema.index({ status: 1 });

// 🟢 FIXED: Safe fallback that preserves the compiled model across hot-reloads
const PurchaseOrder = mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', purchaseOrderSchema);
export default PurchaseOrder;