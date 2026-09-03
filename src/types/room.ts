export type HousekeepingStatus = 'clean' | 'dirty' | 'cleaning' | 'maintenance';

export interface RoomType {
  _id: string;
  hotelId: string;
  hotelName?: string;
  name: string;
  description: string;
  basePrice: number;
  totalRooms: number;
  capacity: number;
  amenities: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  _id: string;
  roomTypeId: string;
  roomTypeName?: string;
  hotelId?: string;
  hotelName?: string;
  roomNumber: string;
  floor: number;
  housekeepingStatus: HousekeepingStatus;
  lastCleaned?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomTypePayload {
  hotelId: string;
  name: string;
  description: string;
  basePrice: number;
  totalRooms: number;
  capacity: number;
  amenities: string[];
}

export interface CreateRoomPayload {
  roomTypeId: string;
  roomNumber: string;
  floor: number;
}

export interface AvailabilityResult {
  hotelId: string;
  hotelName: string;
  hotelCity: string;
  hotelRating: number;
  hotelAmenities: string[];
  roomTypeId: string;
  roomTypeName: string;
  description: string;
  capacity: number;
  availableRooms: number;
  totalRooms: number;
  basePrice: number;
  adjustedPrice: number;
  multiplier: number;
  seasonName: string;
  nights: number;
  totalPrice: number;
  availabilityStatus: 'available' | 'limited' | 'unavailable';
}

export interface AvailabilitySearchParams {
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  city?: string;
  hotelId?: string;
}
