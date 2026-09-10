const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getRoomsByRoomType, getRoomsByHotel, updateRoomStatus } = require('../controllers/roomController');
const { updateHousekeeping } = require('../controllers/housekeepingController');
const { validateObjectId } = require('../middleware/validate');

const router = express.Router();

router.get('/hotel/:hotelId', authenticate, authorize('Admin', 'Staff'), validateObjectId('hotelId'), getRoomsByHotel);
router.get('/:roomTypeId', authenticate, authorize('Admin', 'Staff'), validateObjectId('roomTypeId'), getRoomsByRoomType);
router.put('/:roomId/status', authenticate, authorize('Admin', 'Staff'), validateObjectId('roomId'), updateRoomStatus);
router.put('/:roomId/housekeeping', authenticate, authorize('Admin', 'Staff'), validateObjectId('roomId'), updateHousekeeping);

module.exports = router;
