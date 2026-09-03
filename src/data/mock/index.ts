export { MOCK_HOTELS } from './hotels';
export { MOCK_ROOM_TYPES, MOCK_ROOMS } from './rooms';
export { MOCK_BOOKINGS } from './bookings';
export { MOCK_PRICING_RULES } from './pricing';

export const MOCK_USERS = [
  {
    _id: 'user-001',
    name: 'Admin User',
    email: 'admin@lnt-hotels.com',
    role: 'admin' as const,
    phone: '+1-555-0101',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: 'user-002',
    name: 'John Doe',
    email: 'john.doe@email.com',
    role: 'guest' as const,
    phone: '+1-555-0102',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    _id: 'user-003',
    name: 'Sarah Smith',
    email: 'sarah.smith@email.com',
    role: 'guest' as const,
    phone: '+1-555-0103',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    _id: 'user-004',
    name: 'Staff Member',
    email: 'staff@lnt-hotels.com',
    role: 'staff' as const,
    phone: '+1-555-0104',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

// Demo credentials (for viva/demo purposes only)
export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@lnt-hotels.com', password: 'Admin@123' },
  staff: { email: 'staff@lnt-hotels.com', password: 'Staff@123' },
  guest: { email: 'john.doe@email.com', password: 'Guest@123' },
};
