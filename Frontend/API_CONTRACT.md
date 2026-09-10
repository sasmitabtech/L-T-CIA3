# Velour Hotels API Contract

All endpoints are prefixed with `/api`. JSON request bodies require `Content-Type: application/json`. Protected endpoints use `Authorization: Bearer <jwt>`.

## Roles

- `Guest`: register, log in, search hotels, create and manage their own bookings, view invoices and booking history.
- `Staff`: manage room types, rooms, housekeeping, pricing, and booking check-in/check-out/status workflows.
- `Admin`: all staff actions plus hotel CRUD, reports, dashboard statistics, and pricing/property administration.

## Authentication

| Method | Path | Access | Payload |
|---|---|---|---|
| POST | `/auth/register` | Public | `{ name, email, password }` |
| POST | `/auth/login` | Public | `{ email, password }` |
| GET | `/auth/me` | Authenticated | None |

## Hotels and Room Types

| Method | Path | Access | Payload/query |
|---|---|---|---|
| GET | `/hotels` | Public | None |
| GET | `/hotels/:id` | Public | Hotel ID |
| GET | `/hotels/search` | Public | `city`, `checkIn`, `checkOut`, optional `guests` |
| POST | `/hotels` | Admin | `{ name, city, amenities?, rating? }` |
| PUT | `/hotels/:id` | Admin | Partial hotel fields |
| DELETE | `/hotels/:id` | Admin | Hotel ID |
| GET | `/hotels/:hotelId/room-types` | Public | Hotel ID |
| POST | `/hotels/:hotelId/room-types` | Admin/Staff | `{ name, basePrice, totalRooms, capacity }` |
| GET | `/room-types` | Public | None |
| GET | `/room-types/:id` | Public | Room type ID; falls back to hotel room types when no room type matches |
| POST | `/room-types` | Admin/Staff | `{ hotelId, name, basePrice, totalRooms, capacity }` |
| PUT | `/room-types/:id` | Admin/Staff | Partial room type fields |
| DELETE | `/room-types/:id` | Admin/Staff | Room type ID |

## Bookings and Pricing

| Method | Path | Access | Payload/query |
|---|---|---|---|
| POST | `/bookings` | Authenticated | `{ guestId?, hotelId, roomTypeId, checkIn, checkOut }` |
| GET | `/bookings/:id` | Owner/Staff/Admin | Booking ID |
| PUT | `/bookings/:id/cancel` | Owner/Staff/Admin | `{ reason? }` |
| PUT | `/bookings/:id/status` | Staff/Admin | `{ status }` |
| PUT | `/bookings/:id/checkin` | Staff/Admin | Optional body |
| PUT | `/bookings/:id/checkout` | Staff/Admin | Optional body |
| GET | `/bookings/:id/invoice` | Owner/Staff/Admin | Booking ID |
| GET | `/guests/:guestId/bookings` | Owner/Staff/Admin | Guest ID |
| GET | `/room-types/:roomTypeId/pricing` | Staff/Admin | Room type ID |
| POST | `/pricing-rules` | Staff/Admin | `{ roomTypeId, season, multiplier, startDate?, endDate? }` |
| PUT | `/pricing-rules/:id` | Staff/Admin | Partial pricing rule fields |
| DELETE | `/pricing-rules/:id` | Staff/Admin | Pricing rule ID |

Booking search and creation treat `Reserved`, `Confirmed`, and `Checked-in` records as active. Booking totals apply matching dated rules and weekend rules, and collision detection compares active bookings with `RoomType.totalRooms`.

## Rooms and Operations

| Method | Path | Access | Payload/query |
|---|---|---|---|
| GET | `/room-types/:roomTypeId/rooms` | Staff/Admin | Room type ID |
| GET | `/hotels/:hotelId/rooms` | Staff/Admin | Hotel ID |
| PUT | `/rooms/:roomId/status` | Staff/Admin | `{ status }` |
| GET | `/hotels/:hotelId/housekeeping` | Staff/Admin | Hotel ID |
| PUT | `/rooms/:roomId/housekeeping` | Staff/Admin | `{ status }` |

Valid room statuses are `Clean`, `Dirty`, and `Under Maintenance`. Check-in assigns the first clean room for the booked room type and marks it dirty.

## Reports and Health

| Method | Path | Access | Payload/query |
|---|---|---|---|
| GET | `/admin/reports/occupancy` | Admin | Optional `hotelId`, `from`, `to` |
| GET | `/admin/reports/revenue` | Admin | Optional `hotelId`, `from`, `to` |
| GET | `/admin/dashboard/stats` | Admin | None |
| GET | `/health` | Public | None |

Error responses use `{ success: false, message, errorCode }`.
