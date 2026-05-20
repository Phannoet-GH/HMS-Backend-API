import express from 'express';
import Room from '../models/room.model.js';
import Booking from '../models/booking.model.js';
import auth from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(auth);
router.use(rbac('r1')); // Only admin can access dashboard

router.get('/stats', async (req, res) => {
  try {

    const totalRooms = await Room.countDocuments();

    const availableRooms = await Room.countDocuments({
      status: 'available'
    });

    const occupiedRooms = await Room.countDocuments({
      status: 'occupied'
    });

    const reservedRooms = await Room.countDocuments({
      status: 'reserved'
    });

    const maintenanceRooms = await Room.countDocuments({
      status: 'maintenance'
    });

    const totalBookings = await Booking.countDocuments();

    const activeBookings = await Booking.countDocuments({
      status: { $in: ['confirmed', 'checked_in'] }
    });

    const totalRevenueData = await Booking.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue =
      totalRevenueData.length > 0
        ? totalRevenueData[0].total
        : 0;

    const occupancyRate =
      totalRooms > 0
        ? Math.round((occupiedRooms / totalRooms) * 100)
        : 0;

    res.json({
      totalRooms,
      availableRooms,
      occupiedRooms,
      reservedRooms,
      maintenanceRooms,
      occupancyRate,
      totalBookings,
      activeBookings,
      totalRevenue,
      averageRoomPrice: 120,
      todayCheckIns: 5,
      todayCheckOuts: 3,
      revenueChartData: [1200, 1500, 1700, 1400, 2200, 2500, 2800],
      revenueChartLabels: [
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
        'Sun'
      ]
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

router.get('/room-status', async (req, res) => {

  const rooms = await Room.find()
    .limit(6);

  res.json(rooms);
});

router.get('/recent-bookings', async (req, res) => {

  const bookings = await Booking.find()
    .populate('guest')
    .populate('room')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json(bookings);
});

export default router;
