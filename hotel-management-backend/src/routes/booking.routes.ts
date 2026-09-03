import { Router } from 'express';
import { getAllBookings, getMyBookings, getBookingById, createBooking, updateBookingStatus, cancelBooking } from '../controllers/booking.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/my-bookings', authorize('guest'), getMyBookings);
router.post('/', authorize('guest', 'admin', 'staff'), createBooking);
router.put('/:id/cancel', authorize('guest', 'admin', 'staff'), cancelBooking);

router.get('/', authorize('admin', 'staff'), getAllBookings);
router.get('/:id', authorize('admin', 'staff', 'guest'), getBookingById);
router.put('/:id/status', authorize('admin', 'staff'), updateBookingStatus);

export default router;
