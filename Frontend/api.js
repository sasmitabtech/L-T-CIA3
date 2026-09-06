/* =========================================================
   Velour Hotels — api.js
   All API calls mapped to backend REST endpoints
   ========================================================= */

const API = {
  /* ── AUTH ─────────────────────────────────────────────── */
  register: (data) =>
    apiRequest('POST', '/auth/register', data),

  login: (data) =>
    apiRequest('POST', '/auth/login', data),

  /* ── HOTELS ───────────────────────────────────────────── */
  searchHotels: ({ city, checkIn, checkOut, guests }) =>
    apiRequest('GET', `/hotels/search?city=${city}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`),

  getAllHotels: () =>
    apiRequest('GET', '/hotels'),

  getHotel: (id) =>
    apiRequest('GET', `/hotels/${id}`),

  createHotel: (data) =>
    apiRequest('POST', '/hotels', data),

  updateHotel: (id, data) =>
    apiRequest('PUT', `/hotels/${id}`, data),

  deleteHotel: (id) =>
    apiRequest('DELETE', `/hotels/${id}`),

  /* ── ROOM TYPES ───────────────────────────────────────── */
  getRoomTypes: (hotelId) =>
    apiRequest('GET', `/hotels/${hotelId}/room-types`),

  createRoomType: (hotelId, data) =>
    apiRequest('POST', `/hotels/${hotelId}/room-types`, data),

  updateRoomType: (id, data) =>
    apiRequest('PUT', `/room-types/${id}`, data),

  deleteRoomType: (id) =>
    apiRequest('DELETE', `/room-types/${id}`),

  /* ── ROOMS ────────────────────────────────────────────── */
  getRooms: (roomTypeId) =>
    apiRequest('GET', `/room-types/${roomTypeId}/rooms`),

  getAllRooms: (hotelId) =>
    apiRequest('GET', `/hotels/${hotelId}/rooms`),

  updateRoomStatus: (id, data) =>
    apiRequest('PUT', `/rooms/${id}/status`, data),

  /* ── BOOKINGS ─────────────────────────────────────────── */
  createBooking: (data) =>
    apiRequest('POST', '/bookings', data),

  getBooking: (id) =>
    apiRequest('GET', `/bookings/${id}`),

  getGuestBookings: (guestId) =>
    apiRequest('GET', `/guests/${guestId}/bookings`),

  cancelBooking: (id, reason) =>
    apiRequest('PUT', `/bookings/${id}/cancel`, { reason }),

  checkIn: (id, data) =>
    apiRequest('PUT', `/bookings/${id}/checkin`, data),

  checkOut: (id, data) =>
    apiRequest('PUT', `/bookings/${id}/checkout`, data),

  updateBookingStatus: (id, status) =>
    apiRequest('PUT', `/bookings/${id}/status`, { status }),

  /* ── HOUSEKEEPING ─────────────────────────────────────── */
  getHousekeepingStatus: (hotelId) =>
    apiRequest('GET', `/hotels/${hotelId}/housekeeping`),

  updateHousekeeping: (roomId, status) =>
    apiRequest('PUT', `/rooms/${roomId}/housekeeping`, { status }),

  /* ── INVOICES ─────────────────────────────────────────── */
  getInvoice: (bookingId) =>
    apiRequest('GET', `/bookings/${bookingId}/invoice`),

  /* ── PRICING ──────────────────────────────────────────── */
  getPricingRules: (roomTypeId) =>
    apiRequest('GET', `/room-types/${roomTypeId}/pricing`),

  createPricingRule: (data) =>
    apiRequest('POST', '/pricing-rules', data),

  updatePricingRule: (id, data) =>
    apiRequest('PUT', `/pricing-rules/${id}`, data),

  deletePricingRule: (id) =>
    apiRequest('DELETE', `/pricing-rules/${id}`),

  /* ── REPORTS ──────────────────────────────────────────── */
  getOccupancyReport: ({ hotelId, from, to }) =>
    apiRequest('GET', `/admin/reports/occupancy?hotelId=${hotelId}&from=${from}&to=${to}`),

  getRevenueReport: ({ hotelId, from, to }) =>
    apiRequest('GET', `/admin/reports/revenue?hotelId=${hotelId}&from=${from}&to=${to}`),

  getDashboardStats: () =>
    apiRequest('GET', '/admin/dashboard/stats'),
};

window.API = API;
