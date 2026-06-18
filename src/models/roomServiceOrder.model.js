import mongoose from 'mongoose';

const roomServiceItemSchema = new mongoose.Schema({
    // 📦 Relational Link: Connects directly to an item inside your Inventory collection
    inventoryItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true
    },
    // Captured copy of the name and price at the exact moment of ordering 
    // (This protects historical receipts if item prices change in inventory later)
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
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const roomServiceSchema = new mongoose.Schema({
    // 🛏️ Relational Link: References the actual Room document instance
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    // Flat text fallback string for quick dashboard display columns
    roomNumber: {
        type: String,
        required: true,
        trim: true
    },
    guestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest',
        default: null
    },
    guestName: {
        type: String,
        trim: true
    },
    // 🛒 The Basket: Array of relational inventory stock line items
    items: [roomServiceItemSchema],

    totalAmount: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['requested', 'preparing', 'delivered', 'cancelled'],
        default: 'requested'
    },
    notes: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// 🧮 Auto-calculate the total bill right before writing the order document to MongoDB
roomServiceSchema.pre('save', function (next) {
    if (this.items && this.items.length > 0) {
        this.totalAmount = this.items.reduce((sum, item) => {
            return sum + (item.quantity * item.price);
        }, 0);
    }
    next();
});

// Indexes for super-fast kitchen dashboard and billing queries
roomServiceSchema.index({ roomId: 1 });
roomServiceSchema.index({ status: 1 });
roomServiceSchema.index({ "items.inventoryItemId": 1 });

// 🟢 FIXED: Keeps the compiled model intact inside Mongoose's internal registry across watches
const RoomServiceOrder = mongoose.models.RoomServiceOrder || mongoose.model('RoomServiceOrder', roomServiceSchema);
export default RoomServiceOrder;
