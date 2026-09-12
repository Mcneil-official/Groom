export interface Booking {
  id: string;
  ownerName: string;
  petName: string;
  petType: string;
  service: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  price: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface Service {
  name: string;
  price: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BookingQueryParams {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const SERVICE_PRICES: Record<string, number> = {
  'Bath & Dry': 250,
  'Basic Grooming': 350,
  'Full Grooming': 500,
  'Nail Trimming': 150,
} as const;

export const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];