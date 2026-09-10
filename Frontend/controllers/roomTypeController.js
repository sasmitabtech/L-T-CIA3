const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

async function createRoomType(req, res, next) {
  try {
    const { hotelId, name, basePrice, totalRooms, capacity } = req.body;
    if (!hotelId || !name || basePrice == null || totalRooms == null || capacity == null) return res.status(400).json({ success: false, message: 'hotelId, name, basePrice, totalRooms, and capacity are required' });
    if (!mongoose.isValidObjectId(hotelId)) return res.status(400).json({ success: false, message: 'Invalid hotelId' });
    if (!await Hotel.exists({ _id: hotelId })) return res.status(404).json({ success: false, message: 'Hotel not found' });
    const roomType = await RoomType.create({ hotelId, name, basePrice, totalRooms, capacity });
    return res.status(201).json({ success: true, data: roomType });
  } catch (error) { return next(error); }
}

async function getAllRoomTypes(_req, res, next) {
  try {
    const roomTypes = await RoomType.find().populate('hotelId', 'name city').sort({ name: 1 });
    return res.json({ success: true, data: roomTypes });
  } catch (error) { return next(error); }
}

async function getRoomType(req, res, next) {
  try {
    const roomType = await RoomType.findById(req.params.id).populate('hotelId', 'name city');
    if (!roomType) {
      const roomTypes = await RoomType.find({ hotelId: req.params.id }).sort({ name: 1 });
      if (roomTypes.length) return res.json({ success: true, data: roomTypes });
      return res.status(404).json({ success: false, message: 'Room type or hotel not found' });
    }
    return res.json({ success: true, data: roomType });
  } catch (error) { return next(error); }
}

async function getRoomTypesByHotel(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.hotelId)) return res.status(400).json({ success: false, message: 'Invalid hotelId' });
    const roomTypes = await RoomType.find({ hotelId: req.params.hotelId }).sort({ name: 1 });
    return res.json({ success: true, data: roomTypes });
  } catch (error) { return next(error); }
}

async function updateRoomType(req, res, next) {
  try {
    const { _id, hotelId, ...updates } = req.body;
    const roomType = await RoomType.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!roomType) return res.status(404).json({ success: false, message: 'Room type not found' });
    return res.json({ success: true, data: roomType });
  } catch (error) { return next(error); }
}

async function deleteRoomType(req, res, next) {
  try {
    const active = await Booking.exists({ roomTypeId: req.params.id, status: { $in: ['Reserved', 'Confirmed', 'Checked-in'] } });
    if (active) return res.status(409).json({ success: false, message: 'Cannot delete a room type with active bookings' });
    const roomType = await RoomType.findByIdAndDelete(req.params.id);
    if (!roomType) return res.status(404).json({ success: false, message: 'Room type not found' });
    await Room.deleteMany({ roomTypeId: roomType._id });
    return res.json({ success: true, message: 'Room type deleted' });
  } catch (error) { return next(error); }
}

module.exports = { createRoomType, getAllRoomTypes, getRoomType, getRoomTypesByHotel, updateRoomType, deleteRoomType };
