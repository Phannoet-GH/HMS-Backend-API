const cors = require('cors');
const express = require('express');

const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const guestRoutes = require('./routes/guest.routes');
const roomRoutes = require('./routes/room.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const errorMiddleware = require('./middlewares/error.middleware');

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
app.use('/api/bookings', bookingRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/invoices', invoiceRoutes);

app.use(errorMiddleware);

module.exports = app;
