import { Request, Response, NextFunction } from 'express';
import { Room } from '../models/Room';
import { RoomType } from '../models/RoomType';
import { Hotel } from '../models/Hotel';

export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rooms = await Room.find().populate('roomTypeId');
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    next(error);
  }
};

export const getRoomsByHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rooms = await Room.find({ hotelId: req.params.hotelId }).populate('roomTypeId');
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const checkAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { checkIn, checkOut, guests, rooms, city, hotelId } = req.query;

    let hotelQuery: any = {};
    if (city) {
      hotelQuery.city = { $regex: city, $options: 'i' };
    }
    if (hotelId) {
      hotelQuery._id = hotelId;
    }

    const hotels = await Hotel.find(hotelQuery);
    const hotelIds = hotels.map(h => h._id);

    const roomTypes = await RoomType.find({ hotelId: { $in: hotelIds } }).populate('hotelId');

    const results = roomTypes.map((rt: any) => {
      return {
        hotel: {
          id: rt.hotelId._id,
          name: rt.hotelId.name,
          city: rt.hotelId.city,
          country: rt.hotelId.country,
          rating: rt.hotelId.rating || 4.5,
          image: rt.hotelId.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000'
        },
        roomType: {
          id: rt._id,
          name: rt.name,
          description: rt.description,
          capacity: rt.capacity,
          amenities: rt.amenities,
          pricePerNight: rt.basePrice,
          image: rt.images?.[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=1000'
        },
        availableRooms: rt.totalRooms || 5,
        totalPrice: rt.basePrice 
      };
    }).filter((r: any) => r.availableRooms > 0);

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};


