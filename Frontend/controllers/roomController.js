const mongoose = require('mongoose');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');

async function getRoomsByRoomType(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.roomTypeId)) {
      return res.status(400).json({ success: false, message: 'Invalid roomTypeId' });
    }
    const rooms = await Room.find({ roomTypeId: req.params.roomTypeId }).sort({ roomNumber: 1 });
    return res.json({ success: true, data: rooms });
  } catch (error) {
    return next(error);
  }
}

async function getRoomsByHotel(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.hotelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hotelId' });
    }
    const roomTypes = await RoomType.find({ hotelId: req.params.hotelId }).select('_id');
    const rooms = await Room.find({ roomTypeId: { $in: roomTypes.map(({ _id }) => _id) } }).sort({ roomNumber: 1 });
    return res.json({ success: true, data: rooms });
  } catch (error) {
    return next(error);
  }
}

async function updateRoomStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['Clean', 'Dirty', 'Under Maintenance'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid housekeeping status' });
    }
    const room = await Room.findByIdAndUpdate(
      req.params.roomId,
      { housekeepingStatus: status },
      { new: true, runValidators: true },
    );
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    return res.json({ success: true, data: room });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getRoomsByRoomType, getRoomsByHotel, updateRoomStatus };
