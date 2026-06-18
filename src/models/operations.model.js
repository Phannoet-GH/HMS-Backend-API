import mongoose from 'mongoose';
import { auditLoggerPlugin } from '../utils/audit-logger.plugin.js';

// --- ACTIVITY LOG SCHEMA ---
/// Inside your operations.model.js file
const activityLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  action: { type: String, required: true },
  module: { type: String, required: true },

  // 🟢 CHANGE THIS LINE: Remove required: true
  targetCollection: { type: String, default: 'system' }, // 👈 Fallback value when not specified

  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// --- INVENTORY SCHEMA ---
const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, unique: true, trim: true, sparse: true },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'f&b',
      'linen-textiles',
      'guest-amenities',
      'maintenance-repaired',
      'cleaning-janitorial',
      'office-it'
    ]
  },
  quantity: { type: Number, required: true, default: 0, min: 0 },
  reorderLevel: { type: Number, default: 5, min: 0 },
  unitCost: { type: Number, default: 0, min: 0 },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  supplier: { type: String, trim: true, default: '' },
  status: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock'],
    default: 'in-stock'
  }
}, { timestamps: true });
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
inventoryItemSchema.plugin(auditLoggerPlugin, { module: 'INVENTORY' });
export const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

// --- SUPPLIER SCHEMA ---
const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactName: { type: String },
  email: { type: String },
  category: { type: String }
}, { timestamps: true });
supplierSchema.plugin(auditLoggerPlugin, { module: 'SUPPLIERS' });
export const Supplier = mongoose.model('Supplier', supplierSchema);

// --- SERVICE REQUEST SCHEMA ---
const serviceRequestSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  roomNumber: { type: String, required: true },
  guestName: { type: String, trim: true, default: '' },
  type: {
    type: String,
    required: true,
    enum: ['housekeeping', 'maintenance', 'room-service', 'luggage', 'wake-up-call', 'other'],
    default: 'housekeeping'
  },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  notes: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['open', 'in-progress', 'completed', 'cancelled'], default: 'open' }
}, { timestamps: true });
serviceRequestSchema.plugin(auditLoggerPlugin, { module: 'SERVICE_REQUESTS' });
export const ServiceRequest = mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', serviceRequestSchema);

// --- ROOM SERVICE ORDER SCHEMA ---
const roomServiceItemSchema = new mongoose.Schema({
  inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  itemName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const roomServiceOrderSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  roomNumber: { type: String, required: true },
  guestName: { type: String, trim: true, default: '' },
  items: [roomServiceItemSchema],
  totalAmount: { type: Number, required: true, default: 0, min: 0 },
  notes: { type: String, trim: true },
  status: { type: String, enum: ['requested', 'preparing', 'delivered', 'cancelled'], default: 'requested' }
}, { timestamps: true });
roomServiceOrderSchema.plugin(auditLoggerPlugin, { module: 'ROOM_SERVICE' });
export const RoomServiceOrder = mongoose.models.RoomServiceOrder || mongoose.model('RoomServiceOrder', roomServiceOrderSchema);

// --- PURCHASE ORDER SCHEMA ---
const purchaseOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  supplier: { type: String, required: true },
  items: Array,
  status: { type: String, default: 'pending' }
}, { timestamps: true });
purchaseOrderSchema.plugin(auditLoggerPlugin, { module: 'PURCHASING' });
export const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

// --- DEPARTMENT SCHEMA ---
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  manager: { type: String }
}, { timestamps: true });
departmentSchema.plugin(auditLoggerPlugin, { module: 'DEPARTMENTS' });
export const Department = mongoose.model('Department', departmentSchema);

// --- EMPLOYEE SCHEMA ---
const employeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  department: { type: String, required: true },
  role: { type: String, required: true }
}, { timestamps: true });
employeeSchema.plugin(auditLoggerPlugin, { module: 'HUMAN_RESOURCES' });
export const Employee = mongoose.model('Employee', employeeSchema);
