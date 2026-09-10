const mongoose = require('mongoose');
const PricingRule = require('../models/PricingRule');

async function getPricingRules(req, res, next) {
  try {
    const rules = await PricingRule.find({ roomTypeId: req.params.roomTypeId }).sort({ startDate: 1 });
    return res.json({ success: true, data: rules });
  } catch (error) {
    return next(error);
  }
}

async function createPricingRule(req, res, next) {
  try {
    const { roomTypeId, season, multiplier, startDate, endDate } = req.body;
    if (!roomTypeId || !season || multiplier == null) return res.status(400).json({ success: false, message: 'roomTypeId, season, and multiplier are required' });
    if (!mongoose.isValidObjectId(roomTypeId)) return res.status(400).json({ success: false, message: 'Invalid roomTypeId' });
    const rule = await PricingRule.create({ roomTypeId, season, multiplier, startDate, endDate });
    return res.status(201).json({ success: true, data: rule });
  } catch (error) {
    return next(error);
  }
}

async function updatePricingRule(req, res, next) {
  try {
    const rule = await PricingRule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!rule) return res.status(404).json({ success: false, message: 'Pricing rule not found' });
    return res.json({ success: true, data: rule });
  } catch (error) {
    return next(error);
  }
}

async function deletePricingRule(req, res, next) {
  try {
    const rule = await PricingRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ success: false, message: 'Pricing rule not found' });
    return res.json({ success: true, message: 'Pricing rule deleted' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getPricingRules, createPricingRule, updatePricingRule, deletePricingRule };
