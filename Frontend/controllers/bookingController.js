const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const PricingRule = require('../models/PricingRule');

const ACTIVE_STATUSES = ['Reserved', 'Confirmed', 'Checked-in'];
const STATUS_TRANSITIONS = {
  Reserved: ['Confirmed', 'Cancelled'],
  Confirmed: ['Checked-in', 'Cancelled'],
  'Checked-in': ['Checked-out'],
  'Checked-out': [],
  Cancelled: [],
};

async function createBooking(req, res, next) {
  try {
    const { guestId, hotelId, roomTypeId, checkIn, checkOut } = req.body;
    const effectiveGuestId = req.user.role === 'Guest' ? req.user.id : guestId;
    if (!effectiveGuestId || !hotelId || !roomTypeId || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'guestId, hotelId, roomTypeId, checkIn, and checkOut are required' });
    }
    if (![effectiveGuestId, hotelId, roomTypeId].every(mongoose.isValidObjectId)) {
      return res.status(400).json({ success: false, message: 'Invalid booking identifier' });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ success: false, message: 'checkOut must be after checkIn' });
    }

    const [hotel, roomType] = await Promise.all([
      Hotel.findById(hotelId),
      RoomType.findOne({ _id: roomTypeId, hotelId }),
    ]);
    if (!hotel || !roomType) return res.status(404).json({ success: false, message: 'Hotel or room type not found' });

    const overlappingBookings = await Booking.countDocuments({
      roomTypeId,
      status: { $in: ACTIVE_STATUSES },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });
    if (overlappingBookings >= roomType.totalRooms) {
      return res.status(409).json({ success: false, message: 'No rooms are available for the selected dates', errorCode: 'BOOKING_CONFLICT' });
    }

    const nights = Math.ceil((end - start) / 86400000);
    const multiplier = await calculateMultiplier(roomTypeId, start, end);
    const totalAmount = Math.round(roomType.basePrice * nights * multiplier);
    const booking = await Booking.create({ guestId: effectiveGuestId, hotelId, roomTypeId, checkIn: start, checkOut: end, totalAmount });
    return res.status(201).json({ success: true, data: booking });
  } catch (error) {
    return next(error);
  }
}

async function getBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id).populate('hotelId roomTypeId roomId');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (req.user.role === 'Guest' && booking.guestId.toString() !== req.user.id) return deny(res);
    return res.json({ success: true, data: booking });
  } catch (error) {
    return next(error);
  }
}

async function getAllBookings(_req, res, next) {
  try {
    const bookings = await Booking.find().populate('guestId', 'name email').populate('hotelId', 'name city').populate('roomTypeId', 'name').sort({ createdAt: -1 });
    return res.json({ success: true, data: bookings });
  } catch (error) {
    return next(error);
  }
}

async function getGuestBookings(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.guestId)) return res.status(400).json({ success: false, message: 'Invalid guestId' });
    if (req.user.role === 'Guest' && req.user.id !== req.params.guestId) return deny(res);
    const bookings = await Booking.find({ guestId: req.params.guestId }).populate('hotelId roomTypeId roomId').sort({ checkIn: -1 });
    return res.json({ success: true, data: bookings });
  } catch (error) {
    return next(error);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (req.user.role === 'Guest' && booking.guestId.toString() !== req.user.id) return deny(res);
    if (!ACTIVE_STATUSES.includes(booking.status)) return res.status(400).json({ success: false, message: 'This booking cannot be cancelled' });

    const daysUntilCheckIn = (booking.checkIn - new Date()) / 86400000;
    const feeRate = daysUntilCheckIn > 7 ? 0 : daysUntilCheckIn > 2 ? 0.25 : 0.5;
    booking.cancellationFee = Math.round(booking.totalAmount * feeRate);
    booking.status = 'Cancelled';
    await booking.save();
    return res.json({ success: true, data: { booking, refundAmount: booking.totalAmount - booking.cancellationFee } });
  } catch (error) {
    return next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!STATUS_TRANSITIONS[booking.status]?.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status transition from ${booking.status} to ${status}`, errorCode: 'INVALID_STATUS_TRANSITION' });
    }
    booking.status = status;
    await booking.save();
    return res.json({ success: true, data: booking });
  } catch (error) {
    return next(error);
  }
}

async function checkIn(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!['Reserved', 'Confirmed'].includes(booking.status)) return res.status(400).json({ success: false, message: 'Booking is not eligible for check-in' });
    const room = await Room.findOneAndUpdate(
      { roomTypeId: booking.roomTypeId, housekeepingStatus: 'Clean' },
      { housekeepingStatus: 'Dirty' },
      { new: true, sort: { roomNumber: 1 } },
    );
    if (!room) return res.status(409).json({ success: false, message: 'No clean room is available for check-in' });
    booking.roomId = room._id;
    booking.status = 'Checked-in';
    booking.actualCheckIn = new Date();
    await booking.save();
    return res.json({ success: true, data: booking });
  } catch (error) {
    return next(error);
  }
}

async function checkOut(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'Checked-in') return res.status(400).json({ success: false, message: 'Guest must be checked-in first' });
    booking.status = 'Checked-out';
    booking.actualCheckOut = new Date();
    await booking.save();
    if (booking.roomId) await Room.findByIdAndUpdate(booking.roomId, { housekeepingStatus: 'Dirty' });
    return res.json({ success: true, data: booking });
  } catch (error) {
    return next(error);
  }
}

async function getInvoice(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id).populate('roomTypeId');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (req.user.role === 'Guest' && booking.guestId.toString() !== req.user.id) return deny(res);
    return res.json({ success: true, data: { bookingId: booking._id, subtotal: booking.totalAmount, cancellationFee: booking.cancellationFee, total: booking.totalAmount, checkIn: booking.checkIn, checkOut: booking.checkOut, roomType: booking.roomTypeId?.name } });
  } catch (error) {
    return next(error);
  }
}

async function calculateMultiplier(roomTypeId, start, end) {
  const rules = await PricingRule.find({ roomTypeId, $and: [{ $or: [{ startDate: null }, { startDate: { $lte: end } }] }, { $or: [{ endDate: null }, { endDate: { $gte: start } }] }] });
  let multiplier = 1;
  for (let date = new Date(start); date < end; date.setUTCDate(date.getUTCDate() + 1)) {
    const isWeekend = [0, 6].includes(date.getUTCDay());
    const matchingRules = rules.filter((rule) => {
      const inDates = (!rule.startDate || date >= rule.startDate) && (!rule.endDate || date <= rule.endDate);
      return inDates && (rule.season.toLowerCase() !== 'weekend' || isWeekend);
    });
    multiplier *= Math.max(1, ...matchingRules.map((rule) => rule.multiplier));
  }
  return multiplier;
}

function deny(res) {
  return res.status(403).json({ success: false, message: 'You are not authorized to access this booking' });
}

module.exports = { createBooking, getBooking, getAllBookings, getGuestBookings, cancelBooking, updateStatus, checkIn, checkOut, getInvoice };
