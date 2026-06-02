import express from 'express';

import { crudController } from '../controllers/crud.controller.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';
import {
  ActivityLog,
  Department,
  Employee,
  InventoryItem,
  PurchaseOrder,
  RoomServiceOrder,
  ServiceRequest,
  Supplier
} from '../models/operations.model.js';
import Role from '../models/role.model.js';

const adminRoles = ['r1'];

const registerCrudRoutes = (app, path, controller, writeRoles = adminRoles) => {
  const router = express.Router();

  router.get('/', auth, controller.getAll);
  router.get('/:id', auth, controller.getById);
  router.post('/', auth, rbac(...writeRoles), controller.create);
  router.patch('/:id', auth, rbac(...writeRoles), controller.update);
  router.delete('/:id', auth, rbac(...writeRoles), controller.remove);

  app.use(path, router);
};

export const registerOperationsRoutes = (app) => {
  registerCrudRoutes(app, '/api/inventory', crudController(InventoryItem, 'Inventory item', ['name', 'sku', 'category', 'supplier']));
  registerCrudRoutes(app, '/api/suppliers', crudController(Supplier, 'Supplier', ['name', 'contactName', 'email', 'category']));
  registerCrudRoutes(app, '/api/purchase-orders', crudController(PurchaseOrder, 'Purchase order', ['orderNumber', 'supplier', 'items']));
  registerCrudRoutes(app, '/api/departments', crudController(Department, 'Department', ['name', 'manager']));
  registerCrudRoutes(app, '/api/employees', crudController(Employee, 'Employee', ['fullName', 'department', 'role']));
  registerCrudRoutes(app, '/api/service-requests', crudController(ServiceRequest, 'Service request', ['roomNumber', 'guestName', 'type', 'assignedTo']), ['r1', 'r2', 'r4']);
  registerCrudRoutes(app, '/api/room-services', crudController(RoomServiceOrder, 'Room service order', ['roomNumber', 'guestName', 'items']), ['r1', 'r2', 'r4']);
  registerCrudRoutes(app, '/api/activity-logs', crudController(ActivityLog, 'Activity log', ['actor', 'action', 'module', 'details']));
  registerCrudRoutes(app, '/api/roles', crudController(Role, 'Role', ['roleId', 'name']));
};
