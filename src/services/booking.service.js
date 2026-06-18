import Booking from '../models/booking.model.js';
import Room from '../models/room.model.js';
import Guest from '../models/guest.model.js';

const validBookingStatuses = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];

/**
 * Custom operational error factory helper.
 */
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * 🗺️ Maps reservation states to physical room housekeeping states
 */
const getRoomStatusForBookingStatus = (status) => {
  if (status === 'checked-in') return 'occupied';
  if (status === 'checked-out') return 'dirty'; // 🧼 Flips to dirty for housekeeping attention
  if (status === 'cancelled') return 'available';
  return 'reserved'; // Default fallback for 'pending' or 'confirmed'
};

/**
 * Automatically syncs physical room states based on changing reservation stages.
 */
const syncRoomStatus = async (roomId, bookingStatus) => {
  if (!roomId) return;

  const targetRoomStatus = getRoomStatusForBookingStatus(bookingStatus);
  const room = await Room.findByIdAndUpdate(
    roomId,
    { status: targetRoomStatus },
    { new: true, runValidators: true }
  );

  if (!room) {
    throw createError('Target room not found during operational status sync', 404);
  }

  return room;
};

/**
 * Calculates calendar nights stayed.
 */
const calculateNights = (checkInDate, checkOutDate) => {
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 1;
};

/**
 * ➕ Creates a booking reservation profile along with an inline guest profile entry.
 */
export const createBooking = async (data, userId) => {
  const room = await Room.findById(data.roomId);
  if (!room) {
    throw createError('Room not found', 404);
  }

  if (room.status !== 'available') {
    throw createError('Selected room unit is currently occupied, dirty, or under maintenance', 409);
  }

  const checkInDate = new Date(data.checkInDate);
  const checkOutDate = new Date(data.checkOutDate);

  if (!data.guest || Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    throw createError('Valid guest registration details, check-in, and check-out parameters are required');
  }

  if (checkOutDate <= checkInDate) {
    throw createError('Check-out date schedule must be positioned after the check-in arrival date');
  }

  if (data.status && !validBookingStatuses.includes(data.status)) {
    throw createError('Invalid booking reservation status option provided');
  }

  const nights = calculateNights(checkInDate, checkOutDate);

  // 1. Persist the guest context profile
  const guest = await Guest.create(data.guest);

  // 2. Instantiate booking profile document
  const booking = await Booking.create({
    guestId: guest._id,
    roomId: room._id,
    checkInDate,
    checkOutDate,
    numberOfNights: nights,
    status: data.status || 'confirmed',
    totalAmount: nights * room.pricePerNight,
    createdBy: userId
  });

  // 3. Cascade synchronize the assigned physical room status block
  await syncRoomStatus(room._id, booking.status);

  return Booking.findById(booking._id).populate('guestId  roomId createdBy', '-password');
};

/**
 * 📋 Retrieves booking logs using dynamic query filters.
 */
export const getBookings = (filters = {}) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.roomId) query.roomId = filters.roomId;
  if (filters.guestId) query.guestId = filters.guestId;

  // 🟢 The Precise Approach
  return Booking.find(query)
    .populate({ path: 'guestId' })
    .populate({ path: 'roomId' })
    .populate({
      path: 'createdBy',
      select: '-password' // Only apply this filter to the User model
    })
    .sort({ createdAt: -1 });
};

/**
 * 🔍 Locates a single booking record instance using its Object ID.
 */
export const getBookingById = async (id) => {
  const booking = await Booking.findById(id).populate('guestId roomId createdBy', '-password');
  if (!booking) {
    throw createError('Booking profile ledger document not found', 404);
  }
  return booking;
};

/**
 * 🔄 Standard status override transition logic runner.
 */
export const updateBookingStatus = async (id, status) => {
  if (!validBookingStatuses.includes(status)) {
    throw createError('Target booking registration status parameter is invalid');
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    throw createError('Booking profile not found', 404);
  }

  booking.status = status;
  await booking.save();
  await syncRoomStatus(booking.roomId, status);

  return Booking.findById(booking._id).populate('guestId roomId createdBy', '-password');
};

/**
 * 🛏️ Dedicated Pipeline: Executes explicit check-in workflows.
 */
export const processCheckIn = async (id, checkInData) => {
  const booking = await Booking.findById(id);
  if (!booking) throw createError('Booking profile not found', 404);

  booking.status = 'checked-in';
  booking.actualCheckIn = new Date();
  await booking.save();

  // Flips room state to 'occupied'
  await syncRoomStatus(booking.roomId, 'checked-in');
  return booking;
};

/**
 * 🧹 Dedicated Pipeline: Executes explicit check-out workflows.
 */
export const processCheckOut = async (id, paymentDetails) => {
  const booking = await Booking.findById(id);
  if (!booking) throw createError('Booking profile not found', 404);

  booking.status = 'checked-out';
  booking.actualCheckOut = new Date();
  await booking.save();

  // Flips room state to 'dirty'
  await syncRoomStatus(booking.roomId, 'checked-out');
  return booking;
};

/**
 * ❌ Dedicated Pipeline: Processes cancellations cleanly.
 */
export const processCancellation = async (id) => {
  const booking = await Booking.findById(id);
  if (!booking) throw createError('Booking profile not found', 404);

  booking.status = 'cancelled';
  await booking.save();

  // Restores room state directly back to 'available'
  await syncRoomStatus(booking.roomId, 'cancelled');
  return booking;
};

/**
 * ✏️ Modifies core transactional booking parameters with clean differential comparisons.
 */
export const updateBooking = async (id, data) => {
  const booking = await Booking.findById(id);
  if (!booking) {
    throw createError('Booking document target profile not found', 404);
  }

  const updateData = {};
  const nextStatus = data.status || booking.status;

  if (data.status && !validBookingStatuses.includes(data.status)) {
    throw createError('Target validation booking status value is invalid');
  }

  let nextRoom = null;
  // Handle room transfer modifications seamlessly
  if (data.roomId && String(data.roomId) !== String(booking.roomId)) {
    nextRoom = await Room.findById(data.roomId);
    if (!nextRoom) {
      throw createError('New designated room target file profile not found', 404);
    }
    if (nextRoom.status !== 'available') {
      throw createError('The requested room update switch target is currently unavailable', 409);
    }
    updateData.roomId = nextRoom._id;
  } else {
    nextRoom = await Room.findById(booking.roomId);
  }

  const checkInDate = data.checkInDate ? new Date(data.checkInDate) : booking.checkInDate;
  const checkOutDate = data.checkOutDate ? new Date(data.checkOutDate) : booking.checkOutDate;

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    throw createError('Parsed check-in and check-out parameters must match valid calendar timestamps');
  }

  if (checkOutDate <= checkInDate) {
    throw createError('Check-out modification schedule must reside after check-in timestamp adjustments');
  }

  // Sync relational embedded guest contact alterations
  if (data.guest && booking.guestId) {
    await Guest.findByIdAndUpdate(booking.guestId, data.guest, { runValidators: true });
  }

  updateData.checkInDate = checkInDate;
  updateData.checkOutDate = checkOutDate;
  updateData.status = nextStatus;

  if (nextRoom) {
    updateData.numberOfNights = calculateNights(checkInDate, checkOutDate);
    updateData.totalAmount = updateData.numberOfNights * nextRoom.pricePerNight;
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('guestId roomId createdBy', '-password');

  // If room assignment changed, release the old room back into circulation
  if (data.roomId && String(data.roomId) !== String(booking.roomId)) {
    await syncRoomStatus(booking.roomId, 'cancelled');
  }

  // Update current room configuration state mapping
  await syncRoomStatus(updatedBooking.roomId?._id || updatedBooking.roomId, updatedBooking.status);

  return updatedBooking;
};

/**
 * 🗑️ Purges a booking record completely from history logs.
 */
export const deleteBooking = async (id) => {
  const booking = await Booking.findByIdAndDelete(id);
  if (!booking) {
    throw createError('Booking target document history profile not found', 404);
  }

  // Re-circulate room back into the pool as available upon document deletion
  await syncRoomStatus(booking.roomId, 'cancelled');
  return booking;
};

export default {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  processCheckIn,
  processCheckOut,
  processCancellation,
  updateBooking,
  deleteBooking
};