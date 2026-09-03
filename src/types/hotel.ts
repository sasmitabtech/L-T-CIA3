export interface Hotel {
  _id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  amenities: string[];
  rating: number;
  images: string[];
  phone: string;
  email: string;
  totalRooms?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHotelPayload {
  name: string;
  city: string;
  address: string;
  description: string;
  amenities: string[];
  rating: number;
  phone: string;
  email: string;
}

export interface HotelFilters {
  city?: string;
  rating?: number;
  search?: string;
}
