export interface OccupancyReport {
  totalHotels: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  occupancyRate: number;
  totalBookings: number;
  reservedBookings: number;
  confirmedBookings: number;
  checkedInBookings: number;
  checkedOutBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  periodStart: string;
  periodEnd: string;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
}

export interface OccupancyDataPoint {
  date: string;
  occupancyRate: number;
  occupied: number;
  available: number;
}

export interface BookingStatusDataPoint {
  status: string;
  count: number;
  percentage: number;
}

export interface RoomTypeRevenueDataPoint {
  roomType: string;
  revenue: number;
  bookings: number;
}

export interface AdminReportData {
  summary: OccupancyReport;
  revenueByDay: RevenueDataPoint[];
  occupancyByDay: OccupancyDataPoint[];
  bookingsByStatus: BookingStatusDataPoint[];
  revenueByRoomType: RoomTypeRevenueDataPoint[];
}

export interface ReportFilters {
  hotelId?: string;
  startDate?: string;
  endDate?: string;
  roomTypeId?: string;
}
