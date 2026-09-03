export type { User, UserRole, AuthState, LoginCredentials, RegisterCredentials, AuthResponse } from './auth';
export type { Hotel, CreateHotelPayload, HotelFilters } from './hotel';
export type {
  RoomType,
  Room,
  HousekeepingStatus,
  CreateRoomTypePayload,
  CreateRoomPayload,
  AvailabilityResult,
  AvailabilitySearchParams,
} from './room';
export type {
  Booking,
  BookingStatus,
  CreateBookingPayload,
  CancelBookingPayload,
  BookingStatusTransition,
  RefundCalculation,
} from './booking';
export { VALID_TRANSITIONS, BOOKING_STATUS_LABELS } from './booking';
export type {
  PricingRule,
  PricingSeason,
  CreatePricingRulePayload,
  PriceCalculation,
} from './pricing';
export { SEASON_MULTIPLIERS } from './pricing';
export type {
  OccupancyReport,
  RevenueDataPoint,
  OccupancyDataPoint,
  BookingStatusDataPoint,
  RoomTypeRevenueDataPoint,
  AdminReportData,
  ReportFilters,
} from './reports';

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
