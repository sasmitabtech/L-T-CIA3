# Velour Hotels — Frontend

> Luxury hotel booking and management system  
> Christ University · 5th Semester CIA-3 · L&T EduTech

---

## Tech Stack

| Layer | Technology |
|---|---|
| Server | Node.js + Express.js |
| Styling | Custom CSS design system (no framework) |
| Animations | AOS (Animate On Scroll) |
| Charts | Chart.js 4 |
| Icons | Font Awesome 6 |
| Fonts | Google Fonts — Cormorant Garamond + Inter |

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start          # production
npm run dev        # development (auto-reload with nodemon)

# 3. Open in browser
# http://localhost:3000
```

No `.env` needed for frontend-only demo mode.  
When connecting to your real API backend, set:

```
API_BASE_URL=http://localhost:5000   # your Express API port
```

---

## Pages

| URL | File | Description |
|---|---|---|
| `/` | `public/index.html` | Landing page — hero, hotel cards, testimonials |
| `/login` | `public/login.html` | Login + registration (split layout) |
| `/search` | `public/search.html` | Hotel & room search with filters |
| `/booking` | `public/booking.html` | 4-step booking flow |
| `/dashboard` | `public/guest-dashboard.html` | Guest bookings & history |
| `/admin` | `public/admin/dashboard.html` | Admin panel (all modules) |

### Demo Accounts (auto-filled on login page)
| Role | Email | Password |
|---|---|---|
| Guest | guest@velour.com | demo12345 |
| Admin | admin@velour.com | demo12345 |

---

## Module Coverage

| # | Module | Location |
|---|---|---|
| 1 | Guest Registration & Authentication | `login.html` + `/api/auth/*` |
| 2 | Hotel & Property Management | Admin → Hotels panel |
| 3 | Room Type & Inventory Management | Admin → Rooms & Types panel |
| 4 | Availability Search Engine | `search.html` + `/api/hotels/search` |
| 5 | Reservation Booking Workflow | `booking.html` + `/api/bookings` |
| 6 | Dynamic Pricing Rules | Admin → Pricing Rules panel |
| 7 | Booking Status Management | Admin → Bookings panel |
| 8 | Check-in / Check-out Module | Admin → Check-in/Out panel |
| 9 | Housekeeping Status Tracking | Admin → Housekeeping board |
| 10 | Cancellation & Refund Policy Engine | Guest dashboard → Cancel |
| 11 | Guest Booking History | `guest-dashboard.html` |
| 12 | Invoice Generation Summary | Invoice modal (guest + admin) |
| 13 | Admin Occupancy Reports | Admin → Reports panel |

---

## API Endpoints (stub + real)

All stubs live in `server.js`. Replace with proxy calls to your real API.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Guest registration |
| POST | `/api/auth/login` | Login → returns JWT |

### Hotels
| Method | Path | Description |
|---|---|---|
| GET | `/api/hotels` | List all hotels |
| GET | `/api/hotels/search?city&checkIn&checkOut&guests` | Availability search |
| GET | `/api/hotels/:id` | Single hotel |
| POST | `/api/hotels` | Create hotel (admin) |
| PUT | `/api/hotels/:id` | Update hotel (admin) |
| DELETE | `/api/hotels/:id` | Delete hotel (admin) |

### Room Types
| Method | Path | Description |
|---|---|---|
| GET | `/api/hotels/:hotelId/room-types` | Room types for a hotel |
| POST | `/api/hotels/:hotelId/room-types` | Create room type |
| PUT | `/api/room-types/:id` | Update room type |

### Bookings
| Method | Path | Description |
|---|---|---|
| POST | `/api/bookings` | Create reservation |
| GET | `/api/bookings/:id` | Get booking |
| GET | `/api/guests/:id/bookings` | Guest booking history |
| PUT | `/api/bookings/:id/cancel` | Cancel booking |
| PUT | `/api/bookings/:id/checkin` | Staff check-in |
| PUT | `/api/bookings/:id/checkout` | Staff check-out |
| PUT | `/api/bookings/:id/status` | Update status |
| GET | `/api/bookings/:id/invoice` | Invoice breakdown |

### Housekeeping
| Method | Path | Description |
|---|---|---|
| GET | `/api/hotels/:hotelId/housekeeping` | Room statuses |
| PUT | `/api/rooms/:roomId/housekeeping` | Update room status |

### Pricing
| Method | Path | Description |
|---|---|---|
| GET | `/api/room-types/:id/pricing` | Rules for a room type |
| POST | `/api/pricing-rules` | Create rule |
| DELETE | `/api/pricing-rules/:id` | Delete rule |

### Admin Reports
| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/reports/occupancy` | Monthly occupancy data |
| GET | `/api/admin/reports/revenue` | Monthly revenue data |
| GET | `/api/admin/dashboard/stats` | Dashboard KPIs |

---

## File Structure

```
hotel-frontend/
├── server.js              ← Express server + API stubs
├── package.json
├── README.md
└── public/
    ├── index.html         ← Landing page
    ├── login.html         ← Auth (login + register)
    ├── search.html        ← Hotel search & results
    ├── booking.html       ← 4-step booking flow
    ├── guest-dashboard.html
    ├── admin/
    │   └── dashboard.html ← Full admin panel
    ├── css/
    │   └── style.css      ← Design system
    └── js/
        ├── main.js        ← Shared utilities
        └── api.js         ← API call wrappers
```

---

## Connecting to your backend

1. In `server.js`, install and configure `http-proxy-middleware`:
   ```bash
   npm install http-proxy-middleware
   ```
2. Replace each stub route with:
   ```js
   const { createProxyMiddleware } = require('http-proxy-middleware');
   app.use('/api', createProxyMiddleware({ target: 'http://localhost:5000', changeOrigin: true }));
   ```
3. In `public/js/main.js`, ensure `API_BASE = '/api'` (already set).

---

## Known Limitations (Demo Mode)

- Data is in-memory; restarting the server resets all changes.
- JWT tokens are fake strings, not real signed tokens.
- Payment flow is simulated — no real payment gateway.
- PDF invoice download is stubbed.
- Image panels use CSS gradients (no real hotel photos).

---

*Built for CIA-3 evaluation · Christ University · 5th Semester*
