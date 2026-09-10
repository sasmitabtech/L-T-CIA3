const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true, index: true },
  roomNumber: { type: String, required: true, trim: true },
  housekeepingStatus: { type: String, enum: ['Clean', 'Dirty', 'Under Maintenance'], default: 'Clean' },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
