import express from 'express';
import cors from 'cors';

// 📋 1. Core Authentication & Management Routes
import authRoutes from './routes/auth.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import guestRoutes from './routes/guest.routes.js';
import roomRoutes from './routes/room.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import checkinRoutes from './routes/checkin.routes.js';
import userRoutes from './routes/user.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

// 📋 2. Newly Broken-Out Operations Modular Routes
import inventoryRouter from './routes/inventory.route.js';
import supplierRouter from './routes/supplier.route.js';
import purchaseOrderRouter from './routes/purchase-order.route.js';
import departmentRouter from './routes/department.route.js';
import employeeRouter from './routes/employee.route.js';
import serviceRequestRouter from './routes/service-request.route.js';
import roomServiceRouter from './routes/room-service.route.js';
import activityLogRouter from './routes/activity-log.route.js';
import roleRouter from './routes/role.route.js';

// Global error catcher middleware
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

// Global Middlewares
app.use(cors({
  origin: 'http://localhost:4200', // Allow your Angular dev port
  credentials: true
}));
app.use(express.json());

// Base Server Check Entrypoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hotel Management API is running smoothly',
    version: '1.0.0'
  });
});

// 🚀 Core Entities Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 🚀 Operations Modular Routes (Fully Separated)
app.use('/api/inventory', inventoryRouter);
app.use('/api/suppliers', supplierRouter);
app.use('/api/purchase-orders', purchaseOrderRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/service-requests', serviceRequestRouter);
app.use('/api/room-services', roomServiceRouter);
app.use('/api/activity-logs', activityLogRouter);
app.use('/api/roles', roleRouter);

// 🚨 CRITICAL PLACEMENT: Global Error Middleware MUST be registered dead last!
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`HMS Server running securely on port ${PORT}`));

export default app;