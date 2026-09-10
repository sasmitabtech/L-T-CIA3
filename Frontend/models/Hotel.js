const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  city: { type: String, required: true, trim: true },
  amenities: { type: [String], default: [] },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
