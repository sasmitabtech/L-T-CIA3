/* =========================================================
   Velour Hotels — server.js
   Express server · serves frontend + proxies API calls
   ========================================================= */

const express  = require('express');
const path     = require('path');
const cors     = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ─────────────────────────────────────────── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Static files ───────────────────────────────────────── */
app.use(express.static(__dirname));

/* ── Page routes (explicit, for clean URLs) ─────────────── */
const pages = {
  '/':               'index.html',
  '/login':          'login.html',
  '/register':       'login.html',
  '/search':         'search.html',
  '/booking':        'booking.html',
  '/dashboard':      'guest-dashboard.html',
  '/admin':          'dashboard.html',
  '/admin/dashboard':'dashboard.html',
};

Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

/* ── API Proxy / Stub routes ────────────────────────────── */
/*
  In demo mode these stubs return realistic mock data so the
  frontend works without a running backend. Replace each stub
  with a proxy (http-proxy-middleware) or delete it entirely
  once your Express API server is running on a separate port.
*/

const DEMO_HOTELS = [
  { _id: 'h1', name: 'The Meridian Grand',     city: 'Mumbai',    rating: 5, amenities: ['wifi','pool','spa'], totalRooms: 84 },
  { _id: 'h2', name: 'Harbour Suites Bengaluru',city: 'Bengaluru', rating: 4, amenities: ['wifi','gym'],        totalRooms: 96 },
  { _id: 'h3', name: 'The Atlas, Goa',          city: 'Panaji',   rating: 4, amenities: ['pool','beach'],       totalRooms: 60 },
];

const DEMO_ROOM_TYPES = [
  { _id: 'rt1', hotelId: 'h1', name: 'Standard Double', basePrice: 5200, totalRooms: 24, capacity: 2 },
  { _id: 'rt2', hotelId: 'h1', name: 'Deluxe King',     basePrice: 8200, totalRooms: 36, capacity: 3 },
  { _id: 'rt3', hotelId: 'h1', name: 'Superior Suite',  basePrice: 14500,totalRooms: 12, capacity: 4 },
  { _id: 'rt4', hotelId: 'h2', name: 'Standard Twin',   basePrice: 3600, totalRooms: 48, capacity: 2 },
  { _id: 'rt5', hotelId: 'h2', name: 'Deluxe King',     basePrice: 5400, totalRooms: 36, capacity: 2 },
  { _id: 'rt6', hotelId: 'h3', name: 'Ocean View Room', basePrice: 11800,totalRooms: 40, capacity: 3 },
];

const DEMO_BOOKINGS = [
  { _id: 'b1', guestId:'u001', hotelId:'h1', roomTypeId:'rt2', checkIn:'2026-09-15', checkOut:'2026-09-18', status:'Confirmed',  totalAmount:24600 },
  { _id: 'b2', guestId:'u001', hotelId:'h3', roomTypeId:'rt6', checkIn:'2026-11-02', checkOut:'2026-11-07', status:'Reserved',   totalAmount:59000 },
];

/* -- Auth stubs ------------------------------------------ */
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'guest' } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success:false, message:'Missing required fields', errorCode:'VALIDATION_ERROR' });
  if (password.length < 8)
    return res.status(400).json({ success:false, message:'Password must be at least 8 characters', errorCode:'VALIDATION_ERROR' });

  const user  = { _id: 'u_' + Date.now(), name, email, role };
  const token = 'demo_token_' + Date.now();
  res.status(201).json({ success:true, message:'Registration successful', data: { token, user } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success:false, message:'Email and password required', errorCode:'VALIDATION_ERROR' });

  const role  = email.includes('admin') ? 'admin' : email.includes('staff') ? 'staff' : 'guest';
  const user  = { _id: 'u001', name: role === 'admin' ? 'Admin User' : 'Priya Anand', email, role };
  const token = 'demo_token_' + Date.now();
  res.json({ success:true, message:'Login successful', data: { token, user } });
});

/* -- Hotel stubs ------------------------------------------ */
app.get('/api/hotels', (_req, res) => {
  res.json({ success:true, data: DEMO_HOTELS });
});

app.get('/api/hotels/search', (req, res) => {
  const { city = '', checkIn, checkOut, guests = 1 } = req.query;
  if (!checkIn || !checkOut)
    return res.status(400).json({ success:false, message:'checkIn and checkOut are required', errorCode:'VALIDATION_ERROR' });

  const filtered = DEMO_HOTELS.filter(h =>
    !city || h.city.toLowerCase().includes(city.toLowerCase()) || h.name.toLowerCase().includes(city.toLowerCase())
  );
  res.json({ success:true, data: filtered, meta: { checkIn, checkOut, nights: Math.round((new Date(checkOut)-new Date(checkIn))/86400000), guests } });
});

app.get('/api/hotels/:id', (req, res) => {
  const hotel = DEMO_HOTELS.find(h => h._id === req.params.id);
  if (!hotel) return res.status(404).json({ success:false, message:'Hotel not found', errorCode:'NOT_FOUND' });
  res.json({ success:true, data: hotel });
});

app.post('/api/hotels', (req, res) => {
  const { name, city } = req.body;
  if (!name || !city)
    return res.status(400).json({ success:false, message:'name and city are required', errorCode:'VALIDATION_ERROR' });
  const hotel = { _id: 'h_' + Date.now(), ...req.body };
  DEMO_HOTELS.push(hotel);
  res.status(201).json({ success:true, message:'Hotel created', data: { _id: hotel._id } });
});

app.put('/api/hotels/:id', (req, res) => {
  const idx = DEMO_HOTELS.findIndex(h => h._id === req.params.id);
  if (idx === -1) return res.status(404).json({ success:false, message:'Hotel not found', errorCode:'NOT_FOUND' });
  DEMO_HOTELS[idx] = { ...DEMO_HOTELS[idx], ...req.body };
  res.json({ success:true, message:'Hotel updated', data: DEMO_HOTELS[idx] });
});

app.delete('/api/hotels/:id', (req, res) => {
  const idx = DEMO_HOTELS.findIndex(h => h._id === req.params.id);
  if (idx === -1) return res.status(404).json({ success:false, message:'Hotel not found', errorCode:'NOT_FOUND' });
  DEMO_HOTELS.splice(idx, 1);
  res.json({ success:true, message:'Hotel deleted' });
});

/* -- Room type stubs --------------------------------------- */
app.get('/api/hotels/:hotelId/room-types', (req, res) => {
  const types = DEMO_ROOM_TYPES.filter(rt => rt.hotelId === req.params.hotelId);
  res.json({ success:true, data: types });
});

app.post('/api/hotels/:hotelId/room-types', (req, res) => {
  const { name, basePrice, totalRooms, capacity } = req.body;
  if (!name || !basePrice || !totalRooms)
    return res.status(400).json({ success:false, message:'name, basePrice and totalRooms required', errorCode:'VALIDATION_ERROR' });
  const rt = { _id:'rt_'+Date.now(), hotelId:req.params.hotelId, ...req.body };
  DEMO_ROOM_TYPES.push(rt);
  res.status(201).json({ success:true, message:'Room type created', data:{ _id: rt._id } });
});

app.put('/api/room-types/:id', (req, res) => {
  const idx = DEMO_ROOM_TYPES.findIndex(rt => rt._id === req.params.id);
  if (idx === -1) return res.status(404).json({ success:false, message:'Room type not found', errorCode:'NOT_FOUND' });
  DEMO_ROOM_TYPES[idx] = { ...DEMO_ROOM_TYPES[idx], ...req.body };
  res.json({ success:true, message:'Room type updated', data: DEMO_ROOM_TYPES[idx] });
});

/* -- Booking stubs ----------------------------------------- */
app.post('/api/bookings', (req, res) => {
  const { guestId, hotelId, roomTypeId, checkIn, checkOut } = req.body;
  if (!guestId || !hotelId || !roomTypeId || !checkIn || !checkOut)
    return res.status(400).json({ success:false, message:'Missing required booking fields', errorCode:'VALIDATION_ERROR' });

  // Conflict check: same roomType, overlapping dates
  const conflict = DEMO_BOOKINGS.find(b =>
    b.roomTypeId === roomTypeId &&
    b.status !== 'Cancelled' &&
    new Date(checkIn)  < new Date(b.checkOut) &&
    new Date(checkOut) > new Date(b.checkIn)
  );
  if (conflict)
    return res.status(409).json({ success:false, message:'Room not available for selected dates', errorCode:'BOOKING_CONFLICT' });

  const rt     = DEMO_ROOM_TYPES.find(r => r._id === roomTypeId);
  const nights = Math.round((new Date(checkOut)-new Date(checkIn))/86400000);
  const base   = rt ? rt.basePrice * nights : 0;
  const total  = Math.round(base * 1.18); // +18% GST

  const booking = { _id:'b_'+Date.now(), guestId, hotelId, roomTypeId, checkIn, checkOut, status:'Reserved', totalAmount:total };
  DEMO_BOOKINGS.push(booking);
  res.status(201).json({ success:true, message:'Booking created successfully', data:{ _id: booking._id } });
});

app.get('/api/bookings/:id', (req, res) => {
  const b = DEMO_BOOKINGS.find(b => b._id === req.params.id);
  if (!b) return res.status(404).json({ success:false, message:'Booking not found', errorCode:'NOT_FOUND' });
  res.json({ success:true, data: b });
});

app.get('/api/guests/:id/bookings', (req, res) => {
  const list = DEMO_BOOKINGS.filter(b => b.guestId === req.params.id);
  res.json({ success:true, data: list });
});

app.put('/api/bookings/:id/cancel', (req, res) => {
  const b = DEMO_BOOKINGS.find(b => b._id === req.params.id);
  if (!b) return res.status(404).json({ success:false, message:'Booking not found', errorCode:'NOT_FOUND' });
  if (['Checked-in','Checked-out'].includes(b.status))
    return res.status(409).json({ success:false, message:'Cannot cancel a booking that is already checked-in or completed', errorCode:'INVALID_STATUS_TRANSITION' });
  b.status = 'Cancelled';
  res.json({ success:true, message:'Booking cancelled', data:{ status: b.status } });
});

app.put('/api/bookings/:id/checkin', (req, res) => {
  const b = DEMO_BOOKINGS.find(b => b._id === req.params.id);
  if (!b) return res.status(404).json({ success:false, message:'Booking not found', errorCode:'NOT_FOUND' });
  if (!['Reserved','Confirmed'].includes(b.status))
    return res.status(409).json({ success:false, message:`Cannot check-in a booking with status "${b.status}"`, errorCode:'INVALID_STATUS_TRANSITION' });
  b.status = 'Checked-in';
  b.actualCheckIn = new Date().toISOString();
  res.json({ success:true, message:'Check-in recorded', data:{ status: b.status, actualCheckIn: b.actualCheckIn } });
});

app.put('/api/bookings/:id/checkout', (req, res) => {
  const b = DEMO_BOOKINGS.find(b => b._id === req.params.id);
  if (!b) return res.status(404).json({ success:false, message:'Booking not found', errorCode:'NOT_FOUND' });
  if (b.status !== 'Checked-in')
    return res.status(409).json({ success:false, message:'Guest must be checked-in before checking out', errorCode:'INVALID_STATUS_TRANSITION' });
  b.status = 'Checked-out';
  b.actualCheckOut = new Date().toISOString();
  res.json({ success:true, message:'Check-out recorded', data:{ status: b.status, actualCheckOut: b.actualCheckOut } });
});

app.put('/api/bookings/:id/status', (req, res) => {
  const { status } = req.body;
  const VALID = ['Reserved','Confirmed','Checked-in','Checked-out','Cancelled'];
  if (!VALID.includes(status))
    return res.status(400).json({ success:false, message:`Invalid status. Must be one of: ${VALID.join(', ')}`, errorCode:'VALIDATION_ERROR' });
  const b = DEMO_BOOKINGS.find(b => b._id === req.params.id);
  if (!b) return res.status(404).json({ success:false, message:'Booking not found', errorCode:'NOT_FOUND' });
  b.status = status;
  res.json({ success:true, message:'Status updated', data:{ status } });
});

/* -- Invoice stub ------------------------------------------ */
app.get('/api/bookings/:id/invoice', (req, res) => {
  const b = DEMO_BOOKINGS.find(b => b._id === req.params.id);
  if (!b) return res.status(404).json({ success:false, message:'Booking not found', errorCode:'NOT_FOUND' });
  const rt      = DEMO_ROOM_TYPES.find(r => r._id === b.roomTypeId) || {};
  const nights  = Math.round((new Date(b.checkOut)-new Date(b.checkIn))/86400000);
  const subtotal= rt.basePrice * nights || 0;
  const tax     = Math.round(subtotal * 0.18);
  const total   = subtotal + tax;
  res.json({ success:true, data:{ bookingId:b._id, subtotal, tax, total, nights, roomType:rt.name, checkIn:b.checkIn, checkOut:b.checkOut } });
});

/* -- Housekeeping stubs ------------------------------------ */
app.get('/api/hotels/:hotelId/housekeeping', (req, res) => {
  const statuses = ['Clean','Dirty','In Progress','Maintenance'];
  const rooms    = Array.from({length:20},(_,i)=>({
    roomNumber: (100 + i + 1).toString(),
    hotelId: req.params.hotelId,
    housekeepingStatus: statuses[Math.floor(Math.random()*statuses.length)],
  }));
  res.json({ success:true, data: rooms });
});

app.put('/api/rooms/:roomId/housekeeping', (req, res) => {
  const { status } = req.body;
  const VALID = ['Clean','Dirty','In Progress','Maintenance'];
  if (!VALID.includes(status))
    return res.status(400).json({ success:false, message:`Invalid housekeeping status. Must be one of: ${VALID.join(', ')}`, errorCode:'VALIDATION_ERROR' });
  res.json({ success:true, message:'Housekeeping status updated', data:{ status } });
});

/* -- Pricing rule stubs ------------------------------------ */
const DEMO_PRICING = [
  { _id:'pr1', roomTypeId:'all', season:'weekend',        multiplier:1.25 },
  { _id:'pr2', roomTypeId:'rt2', season:'festival',       multiplier:1.50 },
  { _id:'pr3', roomTypeId:'all', season:'off-peak',       multiplier:0.85 },
  { _id:'pr4', roomTypeId:'rt6', season:'summer-peak',    multiplier:1.80 },
];

app.get('/api/room-types/:id/pricing', (req, res) => {
  const rules = DEMO_PRICING.filter(p => p.roomTypeId === req.params.id || p.roomTypeId === 'all');
  res.json({ success:true, data: rules });
});

app.post('/api/pricing-rules', (req, res) => {
  const { roomTypeId, season, multiplier } = req.body;
  if (!roomTypeId || !season || !multiplier)
    return res.status(400).json({ success:false, message:'roomTypeId, season and multiplier are required', errorCode:'VALIDATION_ERROR' });
  const rule = { _id:'pr_'+Date.now(), ...req.body };
  DEMO_PRICING.push(rule);
  res.status(201).json({ success:true, message:'Pricing rule created', data:{ _id: rule._id } });
});

app.delete('/api/pricing-rules/:id', (req, res) => {
  const idx = DEMO_PRICING.findIndex(p => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ success:false, message:'Rule not found', errorCode:'NOT_FOUND' });
  DEMO_PRICING.splice(idx, 1);
  res.json({ success:true, message:'Pricing rule deleted' });
});

/* -- Admin report stubs ------------------------------------ */
app.get('/api/admin/reports/occupancy', (_req, res) => {
  const months = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
  res.json({ success:true, data: months.map(m=>({ month:m, occupancyRate: Math.round(60+Math.random()*30) })) });
});

app.get('/api/admin/reports/revenue', (_req, res) => {
  const months = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
  res.json({ success:true, data: months.map(m=>({ month:m, revenue: Math.round(25+Math.random()*20) * 100000 })) });
});

app.get('/api/admin/dashboard/stats', (_req, res) => {
  res.json({ success:true, data:{ occupancyRate:78, revenueToday:240000, activeBookings:14, totalHotels:3, totalRooms:240 } });
});

/* ── 404 fallback ───────────────────────────────────────── */
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success:false, message:'API endpoint not found', errorCode:'NOT_FOUND' });
  }
  next();
});

/* ── Centralised error handler ──────────────────────────── */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    success:   false,
    message:   err.message || 'Internal server error',
    errorCode: err.errorCode || 'INTERNAL_ERROR',
  });
});

/* ── Start ──────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n  ✦  Velour Hotels frontend running`);
  console.log(`  →  http://localhost:${PORT}\n`);
});

module.exports = app;
