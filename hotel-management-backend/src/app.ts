import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import hotelRoutes from './routes/hotel.routes';
import roomTypeRoutes from './routes/roomType.routes';
import roomRoutes from './routes/room.routes';
import pricingRoutes from './routes/pricing.routes';
import bookingRoutes from './routes/booking.routes';
import reportRoutes from './routes/report.routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use(errorHandler);

export default app;

