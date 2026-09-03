import { Router } from 'express';
import { getHotels, getHotel, createHotel, updateHotel, deleteHotel } from '../controllers/hotel.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.route('/')
  .get(getHotels)
  .post(protect as any, authorize('admin'), createHotel);

router.route('/:id')
  .get(getHotel)
  .put(protect as any, authorize('admin'), updateHotel)
  .delete(protect as any, authorize('admin'), deleteHotel);

export default router;
