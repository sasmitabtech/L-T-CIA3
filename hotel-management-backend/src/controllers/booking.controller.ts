import { Request, Response, NextFunction } from 'express';
import { Booking } from '../models/Booking';

export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await Booking.find().populate('guestId').populate('roomId');
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guestId = (req as any).user._id;
    const bookings = await Booking.find({ guestId }).populate('roomId');
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('guestId').populate('roomId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guestId = (req as any).user._id;
    const bookingNumber = 'BKG-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const newBooking = new Booking({
      ...req.body,
      bookingNumber,
      guestId
    });
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['confirmed', 'checked-in', 'checked-out', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const updatedBooking = await Booking.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const guestId = (req as any).user._id;
    const booking = await Booking.findOne({ _id: id, guestId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not authorized' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

