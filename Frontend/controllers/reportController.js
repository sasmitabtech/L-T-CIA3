const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');

async function getOccupancyReport(req, res, next) {
  try {
    const { hotelId, from, to } = req.query;
    const start = from ? new Date(from) : new Date(new Date().getFullYear(), 0, 1);
    const end = to ? new Date(to) : new Date();
    if (hotelId && !mongoose.isValidObjectId(hotelId)) return res.status(400).json({ success: false, message: 'Invalid hotelId' });
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) return res.status(400).json({ success: false, message: 'Invalid report date range' });

    const hotels = await Hotel.find(hotelId ? { _id: hotelId } : {}).lean();
    const roomTypes = await RoomType.find(hotelId ? { hotelId } : {}).lean();
    const bookings = await Booking.find({
      hotelId: { $in: hotels.map(({ _id }) => _id) },
      status: { $in: ['Reserved', 'Confirmed', 'Checked-in', 'Checked-out'] },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    }).lean();
    const periodNights = Math.max(1, Math.ceil((end - start) / 86400000));

    const data = hotels.map((hotel) => {
      const capacity = roomTypes.filter((roomType) => roomType.hotelId.toString() === hotel._id.toString()).reduce((sum, roomType) => sum + roomType.totalRooms, 0);
      const hotelBookings = bookings.filter((booking) => booking.hotelId.toString() === hotel._id.toString());
      const bookedRoomNights = hotelBookings.reduce((sum, booking) => {
        const bookingStart = Math.max(start.getTime(), new Date(booking.checkIn).getTime());
        const bookingEnd = Math.min(end.getTime(), new Date(booking.checkOut).getTime());
        return sum + Math.max(0, Math.ceil((bookingEnd - bookingStart) / 86400000));
      }, 0);
      return { hotelId: hotel._id, hotelName: hotel.name, occupancyRate: capacity ? Math.round((bookedRoomNights / (capacity * periodNights)) * 100) : 0, revenue: hotelBookings.reduce((sum, booking) => sum + booking.totalAmount, 0), bookings: hotelBookings.length };
    });
    return res.json({ success: true, data, meta: { from: start, to: end } });
  } catch (error) {
    return next(error);
  }
}

async function getRevenueReport(req, res, next) {
  const response = await getOccupancyReport(req, res, next);
  return response;
}

async function getDashboardStats(_req, res, next) {
  try {
    const [totalHotels, activeBookings, rooms] = await Promise.all([
      Hotel.countDocuments(),
      Booking.countDocuments({ status: { $in: ['Reserved', 'Confirmed', 'Checked-in'] } }),
      RoomType.aggregate([{ $group: { _id: null, totalRooms: { $sum: '$totalRooms' } } }]),
    ]);
    return res.json({ success: true, data: { totalHotels, activeBookings, totalRooms: rooms[0]?.totalRooms || 0 } });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getOccupancyReport, getRevenueReport, getDashboardStats };
