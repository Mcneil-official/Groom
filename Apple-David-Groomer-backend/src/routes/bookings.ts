import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { authMiddleware } from '../middleware/auth.js';
import { getBookings, getBookingById, createBooking, updateBooking, deleteBooking, checkDuplicateBooking } from '../lib/db.js';
import type { Booking, BookingQueryParams, ApiResponse } from '../types.js';

const bookings = new Hono();

// Validation schemas
const createBookingSchema = z.object({
  ownerName: z.string().min(1, 'Owner name is required').regex(/^[a-zA-Z\s]+$/, 'Owner name must contain only letters and spaces'),
  petName: z.string().min(1, 'Pet name is required').regex(/^[a-zA-Z\s]+$/, 'Pet name must contain only letters and spaces'),
  petType: z.string().min(1, 'Pet type is required'),
  service: z.string().min(1, 'Service is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  status: z.enum(['Pending', 'Confirmed', 'Completed', 'Cancelled']).default('Pending'),
});

const updateBookingSchema = createBookingSchema.partial().extend({
  id: z.string().min(1),
});

const querySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

// All routes require auth
bookings.use('*', authMiddleware);

// GET /api/bookings - List bookings with search/filter/pagination
bookings.get('/', zValidator('query', querySchema), async (c) => {
  const params = c.req.valid('query') as BookingQueryParams;
  const result = await getBookings(params);
  return c.json<ApiResponse<typeof result>>({ data: result });
});

// GET /api/bookings/:id - Get single booking
bookings.get('/:id', async (c) => {
  const id = c.req.param('id');
  const booking = await getBookingById(id);
  if (!booking) {
    throw new HTTPException(404, { message: 'Booking not found' });
  }
  return c.json<ApiResponse<Booking>>({ data: booking });
});

// POST /api/bookings - Create booking
bookings.post('/', zValidator('json', createBookingSchema), async (c) => {
  const data = c.req.valid('json');
  
  // Validate date is not in the past
  const appointmentDate = new Date(data.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (appointmentDate < today) {
    throw new HTTPException(400, { message: 'Appointment date cannot be in the past' });
  }
  
  // Check for duplicate booking
  if (await checkDuplicateBooking(data.petName, data.date, data.time)) {
    throw new HTTPException(409, { message: 'This pet already has a booking at this date and time' });
  }
  
  // Calculate price based on service
  const servicePrices: Record<string, number> = {
    'Bath & Dry': 250,
    'Basic Grooming': 350,
    'Full Grooming': 500,
    'Nail Trimming': 150,
  };
  const price = servicePrices[data.service] || 0;
  
  const booking = await createBooking({ ...data, price });
  return c.json<ApiResponse<Booking>>({ data: booking }, 201);
});

// PATCH /api/bookings/:id - Update booking
bookings.patch('/:id', zValidator('json', updateBookingSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  
  const existing = await getBookingById(id);
  if (!existing) {
    throw new HTTPException(404, { message: 'Booking not found' });
  }
  
  // Validate date if provided
  if (data.date) {
    const appointmentDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      throw new HTTPException(400, { message: 'Appointment date cannot be in the past' });
    }
  }
  
  // Check for duplicate if pet/date/time changed
  const petName = data.petName || existing.petName;
  const date = data.date || existing.date;
  const time = data.time || existing.time;
  
  if (await checkDuplicateBooking(petName, date, time, id)) {
    throw new HTTPException(409, { message: 'This pet already has a booking at this date and time' });
  }
  
  // Recalculate price if service changed
  let price = existing.price;
  if (data.service && data.service !== existing.service) {
    const servicePrices: Record<string, number> = {
      'Bath & Dry': 250,
      'Basic Grooming': 350,
      'Full Grooming': 500,
      'Nail Trimming': 150,
    };
    price = servicePrices[data.service] || 0;
  }
  
  const updated = await updateBooking(id, { ...data, price });
  return c.json<ApiResponse<Booking>>({ data: updated! });
});

// DELETE /api/bookings/:id - Delete booking
bookings.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const deleted = await deleteBooking(id);
  if (!deleted) {
    throw new HTTPException(404, { message: 'Booking not found' });
  }
  return c.json<ApiResponse<null>>({ data: null });
});

export default bookings;