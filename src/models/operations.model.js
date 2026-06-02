import mongoose from 'mongoose';

const baseOptions = { timestamps: true };

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, trim: true },
  category: { type: String, required: true, trim: true },
  quantity: { type: Number, default: 0, min: 0 },
  reorderLevel: { type: Number, default: 0, min: 0 },
  unitCost: { type: Number, default: 0, min: 0 },
  supplier: { type: String, trim: true },
  status: { type: String, enum: ['in-stock', 'low-stock', 'out-of-stock'], default: 'in-stock' }
}, baseOptions);

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contactName: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  category: { type: String, trim: true },
  status: { type: String, enum: ['active', 'paused', 'inactive'], default: 'active' }
}, baseOptions);

const purchaseOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, trim: true },
  supplier: { type: String, required: true, trim: true },
  items: { type: String, trim: true },
  totalAmount: { type: Number, default: 0, min: 0 },
  expectedDate: Date,
  status: { type: String, enum: ['draft', 'ordered', 'received', 'cancelled'], default: 'draft' }
}, baseOptions);

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  manager: { type: String, trim: true },
  staffCount: { type: Number, default: 0, min: 0 },
  budget: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, baseOptions);

const employeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  shift: { type: String, enum: ['morning', 'afternoon', 'night', 'flex'], default: 'morning' },
  phone: { type: String, trim: true },
  status: { type: String, enum: ['on-duty', 'off-duty', 'leave'], default: 'on-duty' }
}, baseOptions);

const serviceRequestSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, trim: true },
  guestName: { type: String, trim: true },
  type: { type: String, required: true, trim: true },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  assignedTo: { type: String, trim: true },
  notes: { type: String, trim: true },
  status: { type: String, enum: ['open', 'in-progress', 'completed', 'cancelled'], default: 'open' }
}, baseOptions);

const roomServiceSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, trim: true },
  guestName: { type: String, trim: true },
  items: { type: String, required: true, trim: true },
  totalAmount: { type: Number, default: 0, min: 0 },
  requestedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['requested', 'preparing', 'delivered', 'cancelled'], default: 'requested' },
  notes: { type: String, trim: true }
}, baseOptions);

const activityLogSchema = new mongoose.Schema({
  actor: { type: String, required: true, trim: true },
  action: { type: String, required: true, trim: true },
  module: { type: String, required: true, trim: true },
  details: { type: String, trim: true },
  status: { type: String, enum: ['success', 'warning', 'failed'], default: 'success' }
}, baseOptions);

export const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
export const Supplier = mongoose.model('Supplier', supplierSchema);
export const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
export const Department = mongoose.model('Department', departmentSchema);
export const Employee = mongoose.model('Employee', employeeSchema);
export const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
export const RoomServiceOrder = mongoose.model('RoomServiceOrder', roomServiceSchema);
export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
