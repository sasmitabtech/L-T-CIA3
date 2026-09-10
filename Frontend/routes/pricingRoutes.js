const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getPricingRules, createPricingRule, updatePricingRule, deletePricingRule } = require('../controllers/pricingController');
const { validateIdParam, validateObjectId } = require('../middleware/validate');

const router = express.Router();

router.get('/room-type/:roomTypeId', authenticate, authorize('Admin', 'Staff'), validateObjectId('roomTypeId'), getPricingRules);
router.post('/', authenticate, authorize('Admin'), createPricingRule);
router.put('/:id', authenticate, authorize('Admin'), validateIdParam(), updatePricingRule);
router.delete('/:id', authenticate, authorize('Admin'), validateIdParam(), deletePricingRule);

module.exports = router;
