import { Hotel } from '@/types/hotel';

export const MOCK_HOTELS: Hotel[] = [
  {
    _id: 'hotel-001',
    name: 'L&T Grand Bangalore',
    city: 'Bangalore',
    address: '12, MG Road, Bengaluru, Karnataka 560001',
    description:
      'A flagship luxury property in the heart of Bangalore, offering world-class amenities and impeccable service. Perfect for business travelers and leisure guests alike.',
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Business Center', 'Parking'],
    rating: 4.8,
    images: [],
    phone: '+91-80-4001-1234',
    email: 'grand.bangalore@lnt-hotels.com',
    totalRooms: 120,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z',
  },
  {
    _id: 'hotel-002',
    name: 'L&T Business Suites Mysore',
    city: 'Mysore',
    address: '45, Hunsur Road, Mysuru, Karnataka 570006',
    description:
      'Designed for the modern business traveler, our Mysore property combines comfort with productivity. Located near the industrial corridors and tech parks.',
    amenities: ['Free WiFi', 'Business Center', 'Conference Rooms', 'Gym', 'Restaurant', 'Parking', 'Laundry'],
    rating: 4.5,
    images: [],
    phone: '+91-821-4002-5678',
    email: 'suites.mysore@lnt-hotels.com',
    totalRooms: 80,
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z',
  },
  {
    _id: 'hotel-003',
    name: 'L&T Residency Chennai',
    city: 'Chennai',
    address: '78, Anna Salai, Chennai, Tamil Nadu 600002',
    description:
      'A premium residence experience in the cultural capital of South India. Experience elegant hospitality with easy access to business districts and heritage sites.',
    amenities: ['Free WiFi', 'Swimming Pool', 'Restaurant', 'Gym', 'Spa', 'Concierge', 'Airport Shuttle', 'Parking'],
    rating: 4.6,
    images: [],
    phone: '+91-44-4003-9012',
    email: 'residency.chennai@lnt-hotels.com',
    totalRooms: 95,
    createdAt: '2024-03-05T10:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z',
  },
];
