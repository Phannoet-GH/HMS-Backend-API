import cors from 'cors';
import express from 'express';

import authRoutes from './routes/auth.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import guestRoutes from './routes/guest.routes.js';
import roomRoutes from './routes/room.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import userRoutes from './routes/user.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { registerOperationsRoutes } from './routes/operations.routes.js';
import checkinRoutes from './routes/checkin.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hotel Management API is running',
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/checkins', checkinRoutes);
registerOperationsRoutes(app);

app.use(errorMiddleware);

export default app;
