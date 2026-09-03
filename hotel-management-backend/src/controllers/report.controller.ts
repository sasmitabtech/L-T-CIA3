import { Request, Response, NextFunction } from 'express';
import { Booking } from '../models/Booking';

export const getDashboardReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    const revenueAggregation = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
    
    // Simplistic occupancy rate for demo purposes
    const occupancyRate = 65.5; 

    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5).populate('guestId');

    const bookingStatusData = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      summary: {
        totalBookings,
        occupancyRate,
        totalRevenue,
        cancelledBookings
      },
      recentBookings,
      revenueData: [], // Dummy data or implement actual time-series aggregation
      bookingStatusData
    });
  } catch (error) {
    next(error);
  }
};

