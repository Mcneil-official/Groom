import type { Booking, Service, BookingQueryParams, PaginatedResponse, ApiResponse } from '@apple-david/shared-types';
import { mockApi } from './mock-api';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
    public status: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'apple-david-dev-token-2026';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
        ...options.headers,
      },
    });
    
    const data: ApiResponse<T> = await response.json();
    
    if (!response.ok) {
      const error = data.error || { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred' };
      throw new ApiError(error.code, error.message, error.details, response.status);
    }
    
    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('[API] Backend unavailable, falling back to mock API');
      return useMockApi<T>(endpoint, options);
    }
    throw new ApiError('NETWORK_ERROR', 'Failed to connect to server', undefined, 0);
  }
}

async function useMockApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : undefined;
  
  if (endpoint.startsWith('/bookings')) {
    if (endpoint === '/bookings' || endpoint.startsWith('/bookings?')) {
      if (method === 'GET') {
        const params = new URLSearchParams(endpoint.split('?')[1] || '');
        const searchParams: BookingQueryParams = {};
        if (params.has('search')) searchParams.search = params.get('search')!;
        if (params.has('status')) searchParams.status = params.get('status')!;
        if (params.has('page')) searchParams.page = parseInt(params.get('page')!);
        if (params.has('pageSize')) searchParams.pageSize = parseInt(params.get('pageSize')!);
        return mockApi.bookings.list(searchParams) as Promise<T>;
      }
      if (method === 'POST') {
        return mockApi.bookings.create(body as Omit<Booking, 'id' | 'code'>) as Promise<T>;
      }
    }
    if (endpoint.match(/^\/bookings\/[^\/]+$/)) {
      const id = endpoint.split('/')[2];
      if (method === 'GET') {
        return mockApi.bookings.get(id) as Promise<T>;
      }
      if (method === 'PATCH') {
        return mockApi.bookings.update(id, body as Partial<Booking>) as Promise<T>;
      }
      if (method === 'DELETE') {
        return mockApi.bookings.delete(id) as Promise<T>;
      }
    }
  }
  
  if (endpoint === '/services' && method === 'GET') {
    return mockApi.services.list() as Promise<T>;
  }
  
  if (endpoint === '/auth/verify' && method === 'POST') {
    return { valid: true } as T;
  }
  
  throw new ApiError('NOT_FOUND', `Mock API endpoint not implemented: ${method} ${endpoint}`, undefined, 404);
}

export const api = {
  bookings: {
    list: (params?: BookingQueryParams) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
      const query = searchParams.toString();
      return fetchApi<PaginatedResponse<Booking>>(`/bookings${query ? `?${query}` : ''}`);
    },
    
    get: (id: string) => fetchApi<Booking>(`/bookings/${id}`),
    
    create: (booking: Omit<Booking, 'id'>) => 
      fetchApi<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(booking),
      }),
    
    update: (id: string, booking: Partial<Booking>) =>
      fetchApi<Booking>(`/bookings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...booking, id }),
      }),
    
    delete: (id: string) =>
      fetchApi<null>(`/bookings/${id}`, { method: 'DELETE' }),
  },
  
  services: {
    list: () => fetchApi<Service[]>('/services'),
  },
  
  auth: {
    verify: (token: string) =>
      fetchApi<{ valid: boolean }>('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
  },
};

export function getApiBase() {
  return API_BASE;
}

export function getApiToken() {
  return API_TOKEN;
}