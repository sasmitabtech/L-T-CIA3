import { Request, Response, NextFunction } from 'express';
import { RoomType } from '../models/RoomType';

export const getRoomTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomTypes = await RoomType.find().populate('hotelId');
    res.status(200).json({ success: true, count: roomTypes.length, data: roomTypes });
  } catch (error) {
    next(error);
  }
};

export const getRoomTypesByHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomTypes = await RoomType.find({ hotelId: req.params.hotelId });
    res.status(200).json({ success: true, count: roomTypes.length, data: roomTypes });
  } catch (error) {
    next(error);
  }
};

export const createRoomType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomType = await RoomType.create(req.body);
    res.status(201).json({ success: true, data: roomType });
  } catch (error) {
    next(error);
  }
};

export const updateRoomType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomType = await RoomType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!roomType) {
      return res.status(404).json({ success: false, message: 'RoomType not found' });
    }
    res.status(200).json({ success: true, data: roomType });
  } catch (error) {
    next(error);
  }
};

export const deleteRoomType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomType = await RoomType.findByIdAndDelete(req.params.id);
    if (!roomType) {
      return res.status(404).json({ success: false, message: 'RoomType not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

