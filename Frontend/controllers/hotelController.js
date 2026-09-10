const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const Booking = require('../models/Booking');

const ACTIVE_STATUSES = ['Reserved', 'Confirmed', 'Checked-in'];

async function createHotel(req, res, next) {
  try {
    const { name, city, amenities, rating } = req.body;
    if (!name || !city) return res.status(400).json({ success: false, message: 'Name and city are required' });
    const hotel = await Hotel.create({ name, city, amenities, rating, createdBy: req.user.id });
    return res.status(201).json({ success: true, data: hotel });
  } catch (error) { return next(error); }
}

async function getHotels(_req, res, next) {
  try {
    const hotels = await Hotel.find().sort({ name: 1 });
    return res.json({ success: true, data: hotels });
  } catch (error) { return next(error); }
}

async function getHotel(req, res, next) {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    return res.json({ success: true, data: hotel });
  } catch (error) { return next(error); }
}

async function updateHotel(req, res, next) {
  try {
    const { _id, createdBy, ...updates } = req.body;
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    return res.json({ success: true, data: hotel });
  } catch (error) { return next(error); }
}

async function deleteHotel(req, res, next) {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    await RoomType.deleteMany({ hotelId: hotel._id });
    return res.json({ success: true, message: 'Hotel deleted' });
  } catch (error) { return next(error); }
}

async function searchHotels(req, res, next) {
  try {
    const { city, checkIn, checkOut, guests } = req.query;
    if (!checkIn || !checkOut) return res.status(400).json({ success: false, message: 'checkIn and checkOut are required' });
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) return res.status(400).json({ success: false, message: 'checkOut must be a valid date after checkIn' });
    const hotelQuery = city ? { city: new RegExp(escapeRegExp(city.trim()), 'i') } : {};
    const hotels = await Hotel.find(hotelQuery).sort({ name: 1 }).lean();
    const results = [];
    for (const hotel of hotels) {
      const typeQuery = { hotelId: hotel._id };
      if (guests) typeQuery.capacity = { $gte: Number(guests) || 1 };
      const roomTypes = await RoomType.find(typeQuery).lean();
      const availableTypes = [];
      for (const roomType of roomTypes) {
        const booked = await Booking.countDocuments({ roomTypeId: roomType._id, status: { $in: ACTIVE_STATUSES }, checkIn: { $lt: end }, checkOut: { $gt: start } });
        const availableRooms = Math.max(0, roomType.totalRooms - booked);
        if (availableRooms > 0) availableTypes.push({ ...roomType, availableRooms });
      }
      if (availableTypes.length) results.push({ ...hotel, roomTypes: availableTypes });
    }
    return res.json({ success: true, data: results, meta: { checkIn, checkOut, guests: Number(guests) || 1, nights: Math.ceil((end - start) / 86400000) } });
  } catch (error) { return next(error); }
}

function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

module.exports = { createHotel, getHotels, getHotel, updateHotel, deleteHotel, searchHotels };
