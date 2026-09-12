import type { Booking, Service, BookingQueryParams, PaginatedResponse } from '@apple-david/shared-types';

const MOCK_SERVICES: Service[] = [
  { name: 'Bath & Dry', price: 250 },
  { name: 'Basic Grooming', price: 350 },
  { name: 'Full Grooming', price: 500 },
  { name: 'Nail Trimming', price: 150 },
];

const MOCK_PET_TYPES = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Hamster'];
const MOCK_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'] as const;

const MOCK_BOOKINGS: Booking[] = [
  {
    id: '1',
    code: 'BK-001',
    ownerName: 'Maria Santos',
    petName: 'Mochi',
    petType: 'Dog',
    service: 'Full Grooming',
    price: 500,
    date: '2026-09-15',
    time: '10:00',
    status: 'Confirmed',
  },
  {
    id: '2',
    code: 'BK-002',
    ownerName: 'Juan Dela Cruz',
    petName: 'Bruno',
    petType: 'Dog',
    service: 'Bath & Dry',
    price: 250,
    date: '2026-09-16',
    time: '14:00',
    status: 'Pending',
  },
  {
    id: '3',
    code: 'BK-003',
    ownerName: 'Ana Reyes',
    petName: 'Luna',
    petType: 'Cat',
    service: 'Basic Grooming',
    price: 350,
    date: '2026-09-17',
    time: '09:30',
    status: 'Completed',
  },
  {
    id: '4',
    code: 'BK-004',
    ownerName: 'Pedro Garcia',
    petName: 'Max',
    petType: 'Dog',
    service: 'Nail Trimming',
    price: 150,
    date: '2026-09-18',
    time: '11:00',
    status: 'Pending',
  },
  {
    id: '5',
    code: 'BK-005',
    ownerName: 'Sofia Martinez',
    petName: 'Bella',
    petType: 'Rabbit',
    service: 'Full Grooming',
    price: 500,
    date: '2026-09-19',
    time: '15:30',
    status: 'Cancelled',
  },
  {
    id: '6',
    code: 'BK-006',
    ownerName: 'Carlos Lopez',
    petName: 'Rocky',
    petType: 'Dog',
    service: 'Basic Grooming',
    price: 350,
    date: '2026-09-20',
    time: '10:30',
    status: 'Confirmed',
  },
  {
    id: '7',
    code: 'BK-007',
    ownerName: 'Isabel Torres',
    petName: 'Whiskers',
    petType: 'Cat',
    service: 'Bath & Dry',
    price: 250,
    date: '2026-09-21',
    time: '13:00',
    status: 'Pending',
  },
  {
    id: '8',
    code: 'BK-008',
    ownerName: 'Miguel Santos',
    petName: 'Charlie',
    petType: 'Bird',
    service: 'Nail Trimming',
    price: 150,
    date: '2026-09-22',
    time: '16:00',
    status: 'Completed',
  },
];

let mockBookings = [...MOCK_BOOKINGS];
let nextId = 9;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateCode(): string {
  return `BK-${String(nextId).padStart(3, '0')}`;
}

export const mockApi = {
  bookings: {
    list: async (params?: BookingQueryParams): Promise<PaginatedResponse<Booking>> => {
      await delay(300);
      
      let filtered = [...mockBookings];
      
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(b => 
          b.ownerName.toLowerCase().includes(search) ||
          b.petName.toLowerCase().includes(search) ||
          b.code.toLowerCase().includes(search)
        );
      }
      
      if (params?.status && params.status !== 'All') {
        filtered = filtered.filter(b => b.status === params.status);
      }
      
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 100;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginated = filtered.slice(start, end);
      
      return {
        data: paginated,
        meta: {
          total: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize),
        },
      };
    },
    
    get: async (id: string): Promise<Booking> => {
      await delay(100);
      const booking = mockBookings.find(b => b.id === id);
      if (!booking) throw new Error('Booking not found');
      return { ...booking };
    },
    
    create: async (data: Omit<Booking, 'id' | 'code'>): Promise<Booking> => {
      await delay(300);
      const newBooking: Booking = {
        ...data,
        id: String(nextId),
        code: generateCode(),
      };
      nextId++;
      mockBookings.push(newBooking);
      return { ...newBooking };
    },
    
    update: async (id: string, patch: Partial<Booking>): Promise<Booking> => {
      await delay(300);
      const index = mockBookings.findIndex(b => b.id === id);
      if (index === -1) throw new Error('Booking not found');
      mockBookings[index] = { ...mockBookings[index], ...patch };
      return { ...mockBookings[index] };
    },
    
    delete: async (id: string): Promise<void> => {
      await delay(200);
      const index = mockBookings.findIndex(b => b.id === id);
      if (index === -1) throw new Error('Booking not found');
      mockBookings.splice(index, 1);
    },
  },
  
  services: {
    list: async (): Promise<Service[]> => {
      await delay(100);
      return [...MOCK_SERVICES];
    },
  },
};

export function resetMockData() {
  mockBookings = [...MOCK_BOOKINGS];
  nextId = 9;
}