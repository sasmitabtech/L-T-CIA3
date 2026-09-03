import { Router } from 'express';
import { getRoomTypes, getRoomTypesByHotel, createRoomType, updateRoomType, deleteRoomType } from '../controllers/roomType.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.route('/')
  .get(getRoomTypes)
  .post(protect as any, authorize('admin'), createRoomType);

router.route('/hotel/:hotelId')
  .get(getRoomTypesByHotel);

router.route('/:id')
  .put(protect as any, authorize('admin'), updateRoomType)
  .delete(protect as any, authorize('admin'), deleteRoomType);

export default router;
