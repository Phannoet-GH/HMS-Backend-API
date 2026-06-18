import CheckIn from '../models/checkin.model.js';
import response from '../utils/response.js';

// 📋 GET ALL CHECK-INS
export const getCheckIns = async (req, res, next) => {
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

        response.ok(res, checkins);
    } catch (error) {
        next(error);
    }
};

// 🔍 GET CHECK-IN BY ID
export const getCheckInById = async (req, res, next) => {
    try {
        const checkin = await CheckIn.findById(req.params.id)
            .populate('bookingId', 'guest checkInDate checkOutDate')
            .populate('roomId', 'roomNumber type')
            .populate('employeeId', 'fullName department');

        if (!checkin) {
            const err = new Error('Check-in record not found');
            err.statusCode = 404;
            throw err;
        }

        response.ok(res, checkin);
    } catch (error) {
        next(error);
    }
};

// ➕ CREATE CHECK-IN
export const createCheckIn = async (req, res, next) => {
    try {
        const { bookingId, roomId, actualCheckInTime, keyIssued, status } = req.body;

        const checkin = await CheckIn.create({
            bookingId,
            roomId,
            employeeId: req.user.id, // 🟢 Automatically pulls the active employee ID from JWT
            actualCheckInTime: actualCheckInTime || new Date(),
            keyIssued: keyIssued ?? false,
            status: status || 'completed'
        });

        response.created(res, checkin, 'Check-in event logged successfully');
    } catch (error) {
        next(error);
    }
};

// ✏️ UPDATE CHECK-IN (PUT)
export const updateCheckIn = async (req, res, next) => {
    try {
        const checkin = await CheckIn.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!checkin) {
            const err = new Error('Check-in record not found');
            err.statusCode = 404;
            throw err;
        }

        response.ok(res, checkin, 'Check-in record fully modified');
    } catch (error) {
        next(error);
    }
};

// 🔄 PATCH STATUS
export const updateCheckInStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const checkin = await CheckIn.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!checkin) {
            const err = new Error('Check-in record not found');
            err.statusCode = 404;
            throw err;
        }

        response.ok(res, checkin, `Check-in status successfully changed to ${status}`);
    } catch (error) {
        next(error);
    }
};

// ❌ DELETE CHECK-IN
export const deleteCheckIn = async (req, res, next) => {
    try {
        const checkin = await CheckIn.findByIdAndDelete(req.params.id);

        if (!checkin) {
            const err = new Error('Check-in record not found');
            err.statusCode = 404;
            throw err;
        }

        response.ok(res, null, 'Check-in entry removed successfully');
    } catch (error) {
        next(error);
    }
};