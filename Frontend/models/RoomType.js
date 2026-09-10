const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
  name: { type: String, required: true, trim: true },
  basePrice: { type: Number, required: true, min: 0 },
  totalRooms: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 1 },
}, { timestamps: true });

module.exports = mongoose.model('RoomType', roomTypeSchema);
