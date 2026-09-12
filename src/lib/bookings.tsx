import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

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

const seed: Booking[] = [
  {
    id: "1",
    code: "BK-001",
    ownerName: "Maria Santos",
    petName: "Mochi",
    petType: "Dog",
    service: "Full Grooming",
    price: 500,
    date: "2026-09-15",
    time: "10:00",
    status: "Confirmed",
  },
  {
    id: "2",
    code: "BK-002",
    ownerName: "Juan Dela Cruz",
    petName: "Bruno",
    petType: "Dog",
    service: "Bath & Dry",
    price: 250,
    date: "2026-09-16",
    time: "13:30",
    status: "Pending",
  },
  {
    id: "3",
    code: "BK-003",
    ownerName: "Andrea Lim",
    petName: "Milky",
    petType: "Cat",
    service: "Nail Trimming",
    price: 150,
    date: "2026-09-17",
    time: "09:00",
    status: "Completed",
  },
];

const KEY = "apple-david-bookings";

type Ctx = {
  bookings: Booking[];
  get: (id: string) => Booking | undefined;
  add: (b: Omit<Booking, "id" | "code">) => Booking;
  update: (id: string, b: Partial<Booking>) => void;
  remove: (id: string) => void;
  hasDuplicate: (petName: string, date: string, time: string, ignoreId?: string) => boolean;
};

const BookingsContext = createContext<Ctx | null>(null);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(seed);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setBookings(JSON.parse(raw) as Booking[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(bookings));
    } catch {
      /* ignore */
    }
  }, [bookings]);

  const value = useMemo<Ctx>(
    () => ({
      bookings,
      get: (id) => bookings.find((b) => b.id === id),
      add: (data) => {
        const next = bookings.reduce((max, b) => {
          const n = Number(b.code.replace(/\D/g, ""));
          return Number.isFinite(n) && n > max ? n : max;
        }, 0);
        const booking: Booking = {
          ...data,
          id: crypto.randomUUID(),
          code: `BK-${String(next + 1).padStart(3, "0")}`,
        };
        setBookings((prev) => [...prev, booking]);
        return booking;
      },
      update: (id, patch) =>
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b))),
      remove: (id) => setBookings((prev) => prev.filter((b) => b.id !== id)),
      hasDuplicate: (petName, date, time, ignoreId) =>
        bookings.some(
          (b) =>
            b.id !== ignoreId &&
            b.petName.trim().toLowerCase() === petName.trim().toLowerCase() &&
            b.date === date &&
            b.time === time,
        ),
    }),
    [bookings],
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error("useBookings must be used inside BookingsProvider");
  return ctx;
}
