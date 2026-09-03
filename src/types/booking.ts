export type BookingStatus =
  | 'reserved'
  | 'confirmed'
  | 'checked-in'
  | 'checked-out'
  | 'cancelled';

export interface Booking {
  _id: string;
  bookingNumber: string;
  guestId: string;
  guestName?: string;
  guestEmail?: string;
  hotelId: string;
  hotelName?: string;
  hotelCity?: string;
  roomTypeId: string;
  roomTypeName?: string;
  roomId?: string;
  roomNumber?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  nights: number;
  basePrice: number;
  adjustedPrice: number;
  multiplier: number;
  seasonName: string;
  subtotal: number;
  taxes: number;
  totalAmount: number;
  status: BookingStatus;
  cancellationReason?: string;
  refundAmount?: number;
  refundStatus?: 'pending' | 'processed' | 'none';
  checkinTime?: string;
  checkoutTime?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  specialRequests?: string;
}

export interface CancelBookingPayload {
  bookingId: string;
  reason: string;
}

export interface BookingStatusTransition {
  from: BookingStatus;
  to: BookingStatus;
  allowedRoles: string[];
}

// Valid status transitions
export const VALID_TRANSITIONS: BookingStatusTransition[] = [
  { from: 'reserved', to: 'confirmed', allowedRoles: ['admin', 'staff'] },
  { from: 'confirmed', to: 'checked-in', allowedRoles: ['admin', 'staff'] },
  { from: 'checked-in', to: 'checked-out', allowedRoles: ['admin', 'staff'] },
  { from: 'reserved', to: 'cancelled', allowedRoles: ['admin', 'staff', 'guest'] },
  { from: 'confirmed', to: 'cancelled', allowedRoles: ['admin', 'staff', 'guest'] },
];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  reserved: 'Reserved',
  confirmed: 'Confirmed',
  'checked-in': 'Checked In',
  'checked-out': 'Checked Out',
  cancelled: 'Cancelled',
};

export interface RefundCalculation {
  bookingId: string;
  totalAmount: number;
  refundPercentage: number;
  refundAmount: number;
  policy: string;
  hoursUntilCheckIn: number;
}
