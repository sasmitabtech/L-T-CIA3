import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInHours, differenceInDays, format, parseISO } from 'date-fns';
import { BookingStatus } from '@/types/booking';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatter — USD
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Date formatters
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch {
    return dateString;
  }
}

export function formatDateForInput(dateString: string): string {
  try {
    return format(parseISO(dateString), 'yyyy-MM-dd');
  } catch {
    return dateString;
  }
}

// Calculate number of nights between two date strings
export function calculateNights(checkIn: string, checkOut: string): number {
  return Math.max(0, differenceInDays(parseISO(checkOut), parseISO(checkIn)));
}

// Calculate hours until check-in (for refund policy)
export function hoursUntilCheckIn(checkIn: string): number {
  return differenceInHours(parseISO(checkIn), new Date());
}

// Refund calculation based on policy
export function calculateRefund(totalAmount: number, checkIn: string): {
  refundPercentage: number;
  refundAmount: number;
  policy: string;
} {
  const hours = hoursUntilCheckIn(checkIn);

  if (hours > 48) {
    return {
      refundPercentage: 100,
      refundAmount: totalAmount,
      policy: 'Full refund — cancelled more than 48 hours before check-in',
    };
  } else if (hours >= 24) {
    const refundAmount = totalAmount * 0.5;
    return {
      refundPercentage: 50,
      refundAmount,
      policy: '50% refund — cancelled 24–48 hours before check-in',
    };
  } else {
    return {
      refundPercentage: 0,
      refundAmount: 0,
      policy: 'No refund — cancelled less than 24 hours before check-in',
    };
  }
}

// Dynamic price calculation
export function calculatePrice(
  basePrice: number,
  multiplier: number,
  nights: number,
  rooms: number,
  taxRate = 0.15
) {
  const adjustedPrice = basePrice * multiplier;
  const subtotal = adjustedPrice * nights * rooms;
  const taxes = subtotal * taxRate;
  const total = subtotal + taxes;

  return {
    adjustedPrice: Math.round(adjustedPrice * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    taxes: Math.round(taxes * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// Booking status colors
export const STATUS_COLORS: Record<BookingStatus, string> = {
  reserved: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'checked-in': 'bg-amber-100 text-amber-800 border-amber-200',
  'checked-out': 'bg-slate-100 text-slate-700 border-slate-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
};

// Housekeeping status colors
export const HOUSEKEEPING_COLORS: Record<string, string> = {
  clean: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  dirty: 'bg-rose-100 text-rose-800 border-rose-200',
  cleaning: 'bg-amber-100 text-amber-800 border-amber-200',
  maintenance: 'bg-slate-200 text-slate-700 border-slate-300',
};

// Generate a unique booking number
export function generateBookingNumber(): string {
  return `BK${10000 + Math.floor(Math.random() * 90000)}`;
}

// Truncate text
export function truncate(text: string, length = 100): string {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

// Availability status
export function getAvailabilityStatus(available: number, total: number): 'available' | 'limited' | 'unavailable' {
  if (available === 0) return 'unavailable';
  if (available <= Math.ceil(total * 0.2)) return 'limited';
  return 'available';
}

export const AVAILABILITY_COLORS: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  limited: 'bg-amber-100 text-amber-800 border-amber-200',
  unavailable: 'bg-rose-100 text-rose-800 border-rose-200',
};
