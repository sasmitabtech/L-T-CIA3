const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getHousekeeping, updateHousekeeping } = require('../controllers/housekeepingController');
const { validateObjectId } = require('../middleware/validate');

const router = express.Router();

router.get('/hotel/:hotelId', authenticate, authorize('Admin', 'Staff'), validateObjectId('hotelId'), getHousekeeping);
router.put('/room/:roomId', authenticate, authorize('Admin', 'Staff'), validateObjectId('roomId'), updateHousekeeping);

module.exports = router;
