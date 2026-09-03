import { Router } from 'express';
import { getRooms, getRoomsByHotel, createRoom, updateRoom, deleteRoom, checkAvailability } from '../controllers/room.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/search/availability', checkAvailability);

router.route('/')
  .get(protect as any, authorize('admin', 'staff'), getRooms)
  .post(protect as any, authorize('admin'), createRoom);

router.route('/hotel/:hotelId')
  .get(protect as any, authorize('admin', 'staff'), getRoomsByHotel);

router.route('/:id')
  .put(protect as any, authorize('admin', 'staff'), updateRoom)
  .delete(protect as any, authorize('admin'), deleteRoom);

export default router;
