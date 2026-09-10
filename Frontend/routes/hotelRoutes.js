const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { createHotel, getHotels, getHotel, updateHotel, deleteHotel, searchHotels } = require('../controllers/hotelController');
const { createRoomType, getRoomTypesByHotel } = require('../controllers/roomTypeController');
const { getRoomsByHotel } = require('../controllers/roomController');
const { getHousekeeping } = require('../controllers/housekeepingController');
const { validateIdParam, validateObjectId, validateHotelSearch } = require('../middleware/validate');

const router = express.Router();

router.get('/search', validateHotelSearch, searchHotels);
router.get('/', getHotels);
router.get('/:id', validateIdParam(), getHotel);
router.post('/', authenticate, authorize('Admin'), createHotel);
router.put('/:id', authenticate, authorize('Admin'), validateIdParam(), updateHotel);
router.delete('/:id', authenticate, authorize('Admin'), validateIdParam(), deleteHotel);
router.get('/:hotelId/room-types', validateObjectId('hotelId'), getRoomTypesByHotel);
router.post('/:hotelId/room-types', authenticate, authorize('Admin', 'Staff'), validateObjectId('hotelId'), (req, res, next) => createRoomType({ ...req, body: { ...req.body, hotelId: req.params.hotelId } }, res, next));
router.get('/:hotelId/rooms', authenticate, authorize('Admin', 'Staff'), validateObjectId('hotelId'), getRoomsByHotel);
router.get('/:hotelId/housekeeping', authenticate, authorize('Admin', 'Staff'), validateObjectId('hotelId'), getHousekeeping);

module.exports = router;
