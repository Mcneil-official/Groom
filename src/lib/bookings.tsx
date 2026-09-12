import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, type ApiError } from "./api.js";

export const SERVICES = [
  { name: "Bath & Dry", price: 250 },
  { name: "Basic Grooming", price: 350 },
  { name: "Full Grooming", price: 500 },
  { name: "Nail Trimming", price: 150 },
] as const;

export const PET_TYPES = ["Dog", "Cat", "Rabbit", "Bird", "Hamster"] as const;
export const STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"] as const;

export type Status = (typeof STATUSES)[number];

export type Booking = {
  id: string;
  code: string;
  ownerName: string;
  petName: string;
  petType: string;
  service: string;
  price: number;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  status: Status;
};

export function priceFor(service: string) {
  return SERVICES.find((s) => s.name === service)?.price ?? 0;
}

export function formatDate(date: string) {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function formatTime(time: string) {
  if (!time) return "";
  const parts = time.split(":");
  const h = Number(parts[0] ?? 0);
  const m = Number(parts[1] ?? 0);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function peso(n: number) {
  return `₱${n.toLocaleString("en-PH")}`;
}

type Ctx = {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  get: (id: string) => Promise<Booking | undefined>;
  add: (b: Omit<Booking, "id" | "code">) => Promise<Booking>;
  update: (id: string, b: Partial<Booking>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  hasDuplicate: (petName: string, date: string, time: string, ignoreId?: string) => Promise<boolean>;
};

const BookingsContext = createContext<Ctx | null>(null);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.bookings.list({ pageSize: 100 });
      setBookings(response.data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load bookings';
      setError(message);
      console.error('Failed to fetch bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      bookings,
      isLoading,
      error,
      refetch,
      get: async (id) => {
        try {
          return await api.bookings.get(id);
        } catch (err) {
          console.error('Failed to fetch booking:', err);
          return undefined;
        }
      },
      add: async (data) => {
        const booking = await api.bookings.create(data as any);
        setBookings((prev) => [...prev, booking]);
        return booking;
      },
      update: async (id, patch) => {
        const updated = await api.bookings.update(id, patch);
        setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      },
      remove: async (id) => {
        await api.bookings.delete(id);
        setBookings((prev) => prev.filter((b) => b.id !== id));
      },
      hasDuplicate: async (petName, date, time, ignoreId) => {
        try {
          const response = await api.bookings.list({
            search: petName,
            pageSize: 100,
          });
          return response.data.some(
            (b) =>
              b.id !== ignoreId &&
              b.petName.trim().toLowerCase() === petName.trim().toLowerCase() &&
              b.date === date &&
              b.time === time &&
              b.status !== "Cancelled",
          );
        } catch {
          return false;
        }
      },
    }),
    [bookings, isLoading, error],
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error("useBookings must be used inside BookingsProvider");
  return ctx;
}
