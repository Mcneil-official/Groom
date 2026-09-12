export interface Booking {
    id: string;
    ownerName: string;
    petName: string;
    petType: string;
    service: string;
    date: string;
    time: string;
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
export declare const SERVICE_PRICES: Record<string, number>;
export declare const BOOKING_STATUSES: readonly ["Pending", "Confirmed", "Completed", "Cancelled"];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
//# sourceMappingURL=index.d.ts.map