const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getGuestBookings } = require('../controllers/bookingController');
const { validateObjectId } = require('../middleware/validate');

const router = express.Router();

router.get('/:guestId/bookings', authenticate, validateObjectId('guestId'), getGuestBookings);

module.exports = router;
