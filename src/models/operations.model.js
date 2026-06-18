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
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  quantity: { type: Number, default: 0 }
}, { timestamps: true });
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
  roomNumber: { type: String, required: true },
  guestName: { type: String, required: true },
  type: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' }
}, { timestamps: true });
serviceRequestSchema.plugin(auditLoggerPlugin, { module: 'SERVICE_REQUESTS' });
export const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

// --- ROOM SERVICE ORDER SCHEMA ---
const roomServiceOrderSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  guestName: { type: String, required: true },
  items: Array,
  status: { type: String, default: 'ordered' }
}, { timestamps: true });
roomServiceOrderSchema.plugin(auditLoggerPlugin, { module: 'ROOM_SERVICE' });
export const RoomServiceOrder = mongoose.model('RoomServiceOrder', roomServiceOrderSchema);

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