/* =========================================================
   Velour Hotels - Express server
   ========================================================= */

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const roomTypeRoutes = require('./routes/roomTypeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const roomRoutes = require('./routes/roomRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const housekeepingRoutes = require('./routes/housekeepingRoutes');
const guestRoutes = require('./routes/guestRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}));
app.use(mongoSanitize());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : false)
    : true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[ROUTING DIAGNOSTIC] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', (_req, res) => {
  const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const currentState = mongoose.connection.readyState;

  res.status(currentState === 1 ? 200 : 500).json({
    success: currentState === 1,
    database: stateMap[currentState] || 'unknown',
    readyState: currentState,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/pricing-rules', pricingRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/admin', reportRoutes);

app.use(express.static(__dirname));

const pages = {
  '/': 'index.html',
  '/login': 'login.html',
  '/register': 'login.html',
  '/search': 'search.html',
  '/booking': 'booking.html',
  '/dashboard': 'guest-dashboard.html',
  '/admin': 'dashboard.html',
  '/admin/dashboard': 'dashboard.html',
};

Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (_req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      errorCode: 'NOT_FOUND',
    });
  }
  next();
});

app.use(errorHandler);

let server;

async function shutdown(signal) {
  console.log(`[SHUTDOWN] ${signal} received`);
  if (server) await new Promise(resolve => server.close(resolve));
  await mongoose.connection.close(false)
    .catch(error => console.error('[SHUTDOWN] MongoDB close failed:', error.message));
  process.exit(0);
}

process.on('unhandledRejection', error => {
  console.error('[FATAL] Unhandled promise rejection:', error);
  shutdown('unhandledRejection').catch(() => process.exit(1));
});

process.on('uncaughtException', error => {
  console.error('[FATAL] Uncaught exception:', error);
  shutdown('uncaughtException').catch(() => process.exit(1));
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

server = app.listen(PORT, () => {
  console.log('\n  Velour Hotels server running');
  console.log(`  ->  http://localhost:${PORT}\n`);
});

connectDB().catch(error => {
  console.error('[DATABASE] Unexpected connection failure:', error.message);
});

module.exports = app;