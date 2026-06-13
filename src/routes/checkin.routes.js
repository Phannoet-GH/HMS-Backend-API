import express from 'express';
import CheckIn from '../models/checkin.model.js';
import authenticateToken from '../middlewares/auth.middleware.js';
import rbac from '../middlewares/rbac.middleware.js';
const router = express.Router();
router.use(authenticateToken);

// GET /api/checkins
router.get('/', async (req, res) => {
    try {
        const { status, bookingId, roomId } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (bookingId) filter.bookingId = bookingId;
        if (roomId) filter.roomId = roomId;

        const checkins = await CheckIn.find(filter)
            .populate('bookingId', 'guest checkInDate checkOutDate')
            .populate('roomId', 'roomNumber type')
            .populate('employeeId', 'fullName department')
            .sort({ actualCheckInTime: -1 });

        res.json({ success: true, data: checkins });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/checkins/:id
router.get('/:id', async (req, res) => {
    try {
        const checkin = await CheckIn.findById(req.params.id)
            .populate('bookingId', 'guest checkInDate checkOutDate')
            .populate('roomId', 'roomNumber type')
            .populate('employeeId', 'fullName department');

        if (!checkin) {
            return res.status(404).json({ success: false, message: 'Check-in record not found' });
        }

        res.json({ success: true, data: checkin });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/checkins
router.post('/', async (req, res) => {
    try {
        const { bookingId, roomId, employeeId, actualCheckInTime, keyIssued, status } = req.body;

        const checkin = await CheckIn.create({
            bookingId,
            roomId,
            employeeId,
            actualCheckInTime: actualCheckInTime || new Date(),
            keyIssued: keyIssued ?? false,
            status: status || 'completed'
        });

        res.status(201).json({ success: true, data: checkin });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// PUT /api/checkins/:id
router.put('/:id', async (req, res) => {
    try {
        const checkin = await CheckIn.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!checkin) {
            return res.status(404).json({ success: false, message: 'Check-in record not found' });
        }

        res.json({ success: true, data: checkin });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// PATCH /api/checkins/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const checkin = await CheckIn.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!checkin) {
            return res.status(404).json({ success: false, message: 'Check-in record not found' });
        }

        res.json({ success: true, data: checkin });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE /api/checkins/:id
router.delete('/:id', async (req, res) => {
    try {
        const checkin = await CheckIn.findByIdAndDelete(req.params.id);

        if (!checkin) {
            return res.status(404).json({ success: false, message: 'Check-in record not found' });
        }

        res.json({ success: true, data: null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;