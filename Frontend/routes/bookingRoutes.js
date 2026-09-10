const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validateBooking, validateIdParam, validateObjectId } = require('../middleware/validate');
const {
  createBooking,
  getBooking,
  getAllBookings,
  getGuestBookings,
  cancelBooking,
  updateStatus,
  checkIn,
  checkOut,
  getInvoice,
} = require('../controllers/bookingController');

const router = express.Router();

router.use(authenticate);
router.post('/', validateBooking, createBooking);
router.get('/', authorize('Admin', 'Staff'), getAllBookings);
router.get('/guest/:guestId', validateObjectId('guestId'), getGuestBookings);
router.get('/:id/invoice', validateIdParam(), getInvoice);
router.put('/:id/cancel', validateIdParam(), cancelBooking);
router.put('/:id/status', authorize('Admin', 'Staff'), validateIdParam(), updateStatus);
router.put('/:id/checkin', authorize('Admin', 'Staff'), validateIdParam(), checkIn);
router.put('/:id/checkout', authorize('Admin', 'Staff'), validateIdParam(), checkOut);
router.get('/:id', validateIdParam(), getBooking);

module.exports = router;
