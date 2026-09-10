const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema({
  roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
  season: { type: String, required: true, trim: true },
  multiplier: { type: Number, default: 1.0, min: 0 },
  startDate: Date,
  endDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
