import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Award,
  BadgeCheck,
  Hourglass,
  PawPrint,
  Plus,
  Search,
  SearchX,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { DeleteDialog } from "@/components/DeleteDialog";
import { STATUSES, formatDate, useBookings, type Booking } from "@/lib/bookings";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Booking Dashboard — Apple David Pet Grooming" },
      {
        name: "description",
        content: "View, search and manage every pet grooming appointment booked at Apple David.",
      },
      { property: "og:title", content: "Booking Dashboard — Apple David Pet Grooming" },
      {
        property: "og:description",
        content: "All pet grooming bookings in one simple, cute dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { bookings, remove } = useBookings();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [toDelete, setToDelete] = useState<Booking | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchQ =
        !q ||
        b.ownerName.toLowerCase().includes(q) ||
        b.petName.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q);
      const matchS = status === "All" || b.status === status;
      return matchQ && matchS;
    });
  }, [bookings, query, status]);

  const count = (s: string) => bookings.filter((b) => b.status === s).length;

  return (
    <AppShell
      title="Pet Grooming Booking System"
      subtitle="Every wash, trim and cuddle, neatly scheduled."
      action={
        <Link
          to="/bookings/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-card transition hover:opacity-90"
        >
          <Plus className="size-4" /> New Booking
        </Link>
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Bookings" value={bookings.length} icon={PawPrint} tone="bg-info/25" />
        <Stat label="Pending" value={count("Pending")} icon={Hourglass} tone="bg-warning/25" />
        <Stat label="Confirmed" value={count("Confirmed")} icon={BadgeCheck} tone="bg-success/25" />
        <Stat label="Completed" value={count("Completed")} icon={Award} tone="bg-accent/40" />
      </div>

      <div className="rounded-2xl bg-card p-5 shadow-card">
        <div className="mb-4 flex flex-wrap gap-3">
          <label className="flex min-w-56 flex-1 items-center gap-2 rounded-xl bg-secondary px-4 py-2.5">
            <Search className="size-4 text-muted-foreground" />
            <span className="sr-only">Search bookings</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bookings..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="All">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead>
              <tr className="text-xs tracking-wide text-muted-foreground uppercase">
                <th className="px-3 py-3">Code</th>
                <th className="px-3 py-3">Owner</th>
                <th className="px-3 py-3">Pet</th>
                <th className="px-3 py-3">Service</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className="cursor-pointer border-t border-border transition hover:bg-secondary/60"
                  onClick={() => navigate({ to: "/bookings/$id", params: { id: b.id } })}
                >
                  <td className="px-3 py-3 font-bold text-primary">{b.code}</td>
                  <td className="px-3 py-3">{b.ownerName}</td>
                  <td className="px-3 py-3">
                    {b.petName} <span className="text-muted-foreground">({b.petType})</span>
                  </td>
                  <td className="px-3 py-3">{b.service}</td>
                  <td className="px-3 py-3">{formatDate(b.date)}</td>
                  <td className="px-3 py-3">
                    <StatusPill status={b.status} />
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <Link
                      to="/bookings/$id/edit"
                      params={{ id: b.id }}
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    <span className="px-2 text-border">|</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setToDelete(b);
                      }}
                      className="font-semibold text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <SearchX className="size-4" /> No bookings found.
                    </span>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteDialog
        booking={toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) remove(toDelete.id);
          setToDelete(null);
        }}
      />
    </AppShell>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className={`mb-3 inline-flex size-9 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="size-4" />
      </div>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
