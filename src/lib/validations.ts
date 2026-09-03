import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Hotel schemas
export const hotelSchema = z.object({
  name: z.string().min(2, 'Hotel name must be at least 2 characters'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  amenities: z.array(z.string()).min(1, 'At least one amenity is required'),
  rating: z.number().min(1).max(5),
  phone: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Please enter a valid email'),
});

// Room type schemas
export const roomTypeSchema = z.object({
  hotelId: z.string().min(1, 'Hotel is required'),
  name: z.string().min(2, 'Room type name is required'),
  description: z.string().min(10, 'Description is required'),
  basePrice: z.number().positive('Base price must be positive'),
  totalRooms: z.number().int().positive('Total rooms must be a positive integer'),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  amenities: z.array(z.string()).min(1, 'At least one amenity is required'),
});

// Room schemas
export const roomSchema = z.object({
  roomTypeId: z.string().min(1, 'Room type is required'),
  roomNumber: z.string().min(1, 'Room number is required'),
  floor: z.number().int().positive('Floor must be a positive integer'),
});

// Availability search schema
export const availabilitySearchSchema = z
  .object({
    checkIn: z.string().min(1, 'Check-in date is required'),
    checkOut: z.string().min(1, 'Check-out date is required'),
    guests: z.number().int().min(1, 'At least 1 guest is required').max(20),
    rooms: z.number().int().min(1, 'At least 1 room is required').max(10),
    city: z.string().optional(),
    hotelId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.checkIn && data.checkOut) {
        return new Date(data.checkOut) > new Date(data.checkIn);
      }
      return true;
    },
    {
      message: 'Check-out date must be after check-in date',
      path: ['checkOut'],
    }
  );

// Booking schema
export const bookingSchema = z.object({
  specialRequests: z.string().max(500).optional(),
});

// Cancellation schema
export const cancellationSchema = z.object({
  reason: z.string().min(5, 'Please provide a reason for cancellation').max(500),
});

// Pricing rule schema
export const pricingRuleSchema = z.object({
  roomTypeId: z.string().min(1, 'Room type is required'),
  season: z.enum(['normal', 'weekend', 'festival', 'peak']),
  seasonLabel: z.string().min(1, 'Season label is required'),
  multiplier: z.number().min(0.1, 'Multiplier must be at least 0.1').max(10, 'Multiplier cannot exceed 10'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type HotelFormValues = z.infer<typeof hotelSchema>;
export type RoomTypeFormValues = z.infer<typeof roomTypeSchema>;
export type RoomFormValues = z.infer<typeof roomSchema>;
export type AvailabilitySearchValues = z.infer<typeof availabilitySearchSchema>;
export type BookingFormValues = z.infer<typeof bookingSchema>;
export type CancellationFormValues = z.infer<typeof cancellationSchema>;
export type PricingRuleFormValues = z.infer<typeof pricingRuleSchema>;
