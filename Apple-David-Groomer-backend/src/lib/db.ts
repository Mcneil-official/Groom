import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { fileURLToPath } from 'url';
import type { Booking, Service, BookingQueryParams, PaginatedResponse } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..', '..', '..');

interface DbSchema {
  bookings: Booking[];
  services: Service[];
}

const defaultData: DbSchema = {
  bookings: [],
  services: [],
};

const adapter = new JSONFile<DbSchema>(join(__dirname, 'db.json'));
const db = new Low(adapter, defaultData);

await db.read();

if (!db.data) {
  db.data = defaultData;
  await db.write();
}

export async function getBookings(params: BookingQueryParams = {}): Promise<PaginatedResponse<Booking>> {
  await db.read();
  const { search = '', status, page = 1, pageSize = 10 } = params;
  let bookings = db.data!.bookings;

  if (search) {
    const s = search.toLowerCase();
    bookings = bookings.filter(
      (b) =>
        b.ownerName.toLowerCase().includes(s) ||
        b.petName.toLowerCase().includes(s) ||
        b.id.toLowerCase().includes(s)
    );
  }

  if (status && status !== 'All') {
    bookings = bookings.filter((b) => b.status === status);
  }

  const total = bookings.length;
  const start = (page - 1) * pageSize;
  const data = bookings.slice(start, start + pageSize);

  return { data, total, page, pageSize };
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  await db.read();
  return db.data!.bookings.find((b) => b.id === id);
}

export async function createBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
  await db.read();
  const bookings = db.data!.bookings;
  const maxId = bookings.reduce((max, b) => {
    const num = parseInt(b.id.replace('BK-', ''), 10);
    return num > max ? num : max;
  }, 0);
  const newId = `BK-${String(maxId + 1).padStart(3, '0')}`;
  const newBooking = { ...booking, id: newId };
  db.data!.bookings.push(newBooking);
  await db.write();
  return newBooking;
}

export async function updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined> {
  await db.read();
  const index = db.data!.bookings.findIndex((b) => b.id === id);
  if (index === -1) return undefined;
  const updated = { ...db.data!.bookings[index], ...updates };
  db.data!.bookings[index] = updated;
  await db.write();
  return updated;
}

export async function deleteBooking(id: string): Promise<boolean> {
  await db.read();
  const index = db.data!.bookings.findIndex((b) => b.id === id);
  if (index === -1) return false;
  db.data!.bookings.splice(index, 1);
  await db.write();
  return true;
}

export async function getServices(): Promise<Service[]> {
  await db.read();
  return db.data!.services;
}

export async function checkDuplicateBooking(
  petName: string,
  date: string,
  time: string,
  excludeId?: string
): Promise<boolean> {
  await db.read();
  const bookings = db.data!.bookings;
  return bookings.some(
    (b) =>
      b.petName === petName &&
      b.date === date &&
      b.time === time &&
      b.id !== excludeId &&
      b.status !== 'Cancelled'
  );
}