import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BadgeCheck, CalendarX, Cat, ChevronLeft, ChevronRight, Dog, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { formatDate, formatTime, useBookings } from "@/lib/bookings";
import type { Booking, Status } from "@/lib/bookings";

function checkAuth() {
  const user = localStorage.getItem("apple-david-user");
  if (!user) {
    throw new Error("Not authenticated");
  }
}

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Apple David Pet Grooming" },
      {
        name: "description",
        content: "See every grooming appointment on one cozy calendar.",
      },
      { property: "og:title", content: "Calendar — Apple David Pet Grooming" },
      {
        property: "og:description",
        content: "All pet grooming appointments, at a glance.",
      },
    ],
  }),
  beforeLoad: () => {
    checkAuth();
  },
  component: CalendarPage,
});

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const STATUS_DOT: Record<Status, string> = {
  Pending: "bg-warning",
  Confirmed: "bg-info",
  Completed: "bg-success",
  Cancelled: "bg-destructive",
};

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function CalendarPage() {
  const { bookings } = useBookings();
  const [selected, setSelected] = useState<Date>(startOfToday);
  const [cursor, setCursor] = useState<Date>(() => {
    const t = startOfToday();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });

  const byDate = useMemo(() => {
    const byDate = new Map<string, Booking[]>();
    for (const b of bookings) {
      const list = byDate.get(b.date);
      if (list) list.push(b);
      else byDate.set(b.date, [b]);
    }
    for (const list of byDate.values()) {
      list.sort((a, b) => a.time.localeCompare(b.time));
    }
    return byDate;
  }, [bookings]);

  const weeks = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const rows = Math.ceil((offset + daysInMonth) / 7);
    const gridStart = new Date(first);
    gridStart.setDate(1 - offset);
    const weeks: Date[][] = [];
    for (let r = 0; r < rows; r++) {
      const week: Date[] = [];
      for (let c = 0; c < 7; c++) {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + r * 7 + c);
        week.push(d);
      }
      weeks.push(week);
    }
    return weeks;
  }, [cursor]);

  const upcoming = useMemo(() => {
    const todayKey = toDateKey(startOfToday());
    return bookings
      .filter((b) => b.date >= todayKey)
      .sort((a, b) =>
        a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date),
      )
      .slice(0, 5);
  }, [bookings]);

  const selectedKey = selected ? toDateKey(selected) : "";
  const todayKey = toDateKey(startOfToday());
  const dayBookings: Booking[] = selected ? (byDate.get(selectedKey) ?? []) : [];

  const goToday = () => {
    const t = startOfToday();
    setSelected(t);
    setCursor(new Date(t.getFullYear(), t.getMonth(), 1));
  };

  return (
    <AppShell
      title="Booking Calendar"
      subtitle="Every appointment, one cozy look at a time."
      action={
        <Link
          to="/bookings/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-card transition hover:opacity-90"
        >
          <Plus className="size-4" /> New Booking
        </Link>
      }
    >
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-2xl bg-card p-4 shadow-card sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">
              {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={goToday}
                className="rounded-full border border-border px-4 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() =>
                  setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                }
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                }
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d, i) => (
              <div
                key={`${d}-${i}`}
                className="pb-1 text-center text-[11px] font-bold tracking-wide text-muted-foreground uppercase"
              >
                {d}
              </div>
            ))}
            {weeks.flat().map((date) => {
              const key = toDateKey(date);
              const list = byDate.get(key) ?? [];
              const isOutside = date.getMonth() !== cursor.getMonth();
              const isToday = key === todayKey;
              const isSelected = key === selectedKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(date)}
                  className={`flex min-h-16 flex-col gap-1 rounded-xl p-1.5 text-left transition sm:min-h-20 ${
                    isSelected ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-secondary/70"
                  } ${isOutside ? "opacity-40" : ""}`}
                >
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : isSelected
                          ? "text-primary"
                          : "text-foreground"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {!isOutside && (
                    <span className="flex min-w-0 flex-col gap-0.5">
                      {list.slice(0, 2).map((b) => (
                        <span
                          key={b.id}
                          className="flex min-w-0 items-center gap-1 truncate rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold"
                        >
                          <span
                            className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[b.status]}`}
                          />
                          <span className="truncate">{b.petName}</span>
                        </span>
                      ))}
                      {list.length > 2 ? (
                        <span className="px-1.5 text-[10px] font-bold text-muted-foreground">
                          +{list.length - 2} more
                        </span>
                      ) : null}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-[11px] font-semibold text-muted-foreground">
            {(Object.keys(STATUS_DOT) as Status[]).map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full ${STATUS_DOT[s]}`} />
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">
                {selected
                  ? selected.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "Pick a day"}
              </h2>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                {dayBookings.length} {dayBookings.length === 1 ? "booking" : "bookings"}
              </span>
            </div>

            {dayBookings.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
                  <CalendarX className="size-5" />
                </span>
                No appointments scheduled.
                <Link
                  to="/bookings/new"
                  className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                >
                  <Plus className="size-4" /> Book one
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {dayBookings.map((b) => {
                  const PetIcon = b.petType === "Cat" ? Cat : Dog;
                  return (
                    <li key={b.id}>
                      <Link
                        to="/bookings/$id"
                        params={{ id: b.id }}
                        className="group flex items-center gap-3 rounded-xl bg-secondary/60 p-3 transition hover:bg-secondary"
                      >
                        <span className="w-16 shrink-0 text-xs font-bold text-primary">
                          {formatTime(b.time)}
                        </span>
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-primary">
                          <PetIcon className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-bold">
                            {b.petName}{" "}
                            <span className="font-normal text-muted-foreground">({b.petType})</span>
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {b.ownerName} · {b.service}
                          </span>
                          <span className="mt-1 block">
                            <StatusPill status={b.status} />
                          </span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-2xl bg-card p-5 shadow-card">
            <h2 className="mb-4 text-sm font-bold tracking-wide text-muted-foreground uppercase">
              Coming up next
            </h2>
            {upcoming.length === 0 ? (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <BadgeCheck className="size-4" /> Nothing scheduled ahead — all clear.
              </div>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((b) => (
                  <li key={b.id}>
                    <Link
                      to="/bookings/$id"
                      params={{ id: b.id }}
                      className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3 transition hover:bg-secondary"
                    >
                      <span className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-card py-1.5">
                        <span className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                          {new Date(`${b.date}T00:00:00`).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </span>
                        <span className="text-base leading-none font-bold">
                          {new Date(`${b.date}T00:00:00`).getDate()}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">
                          {b.petName} · {b.service}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {formatDate(b.date)} · {formatTime(b.time)}
                        </span>
                      </span>
                      <span
                        className={`size-2 shrink-0 rounded-full ${STATUS_DOT[b.status]}`}
                        title={b.status}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
