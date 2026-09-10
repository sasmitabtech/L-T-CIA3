const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { createRoomType, getAllRoomTypes, getRoomType, updateRoomType, deleteRoomType } = require('../controllers/roomTypeController');
const { getRoomsByRoomType } = require('../controllers/roomController');
const { getPricingRules } = require('../controllers/pricingController');
const { validateIdParam, validateObjectId } = require('../middleware/validate');

const router = express.Router();

router.get('/', getAllRoomTypes);
router.post('/', authenticate, authorize('Admin', 'Staff'), createRoomType);
router.get('/:id/rooms', authenticate, authorize('Admin', 'Staff'), validateIdParam(), getRoomsByRoomType);
router.get('/:roomTypeId/pricing', authenticate, authorize('Admin', 'Staff'), validateObjectId('roomTypeId'), getPricingRules);
router.get('/:id', validateIdParam(), getRoomType);
router.put('/:id', authenticate, authorize('Admin', 'Staff'), validateIdParam(), updateRoomType);
router.delete('/:id', authenticate, authorize('Admin', 'Staff'), validateIdParam(), deleteRoomType);

module.exports = router;
