import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Cat, Dog } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DeleteDialog } from "@/components/DeleteDialog";
import { StatusPill } from "@/components/StatusPill";
import { formatDate, formatTime, peso, useBookings, type Booking } from "@/lib/bookings";

function checkAuth() {
  const user = localStorage.getItem("apple-david-user");
  if (!user) {
    throw new Error("Not authenticated");
  }
}

export const Route = createFileRoute("/bookings/$id")({
  head: () => ({
    meta: [
      { title: "Booking Details — Apple David Pet Grooming" },
      {
        name: "description",
        content: "Full details of a pet grooming appointment: pet, service, schedule and price.",
      },
      { property: "og:title", content: "Booking Details — Apple David Pet Grooming" },
      {
        property: "og:description",
        content: "Review a grooming appointment before confirming or updating it.",
      },
    ],
  }),
  beforeLoad: () => {
    checkAuth();
  },
  component: BookingDetails,
});

function BookingDetails() {
  const { id } = useParams({ from: "/bookings/$id" });
  const { get, remove } = useBookings();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [booking, setBooking] = useState<Booking | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    get(id).then((b) => {
      if (!cancelled) {
        setBooking(b);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [id, get]);

  if (isLoading) {
    return (
      <AppShell title="Booking Details" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!booking) {
    return (
      <AppShell title="Booking not found">
        <p className="text-sm text-muted-foreground">
          This booking no longer exists.{" "}
          <Link to="/dashboard" className="font-semibold text-primary hover:underline">
            Back to dashboard
          </Link>
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Booking Details"
      subtitle={`Booking Code: ${booking.code}`}
      action={
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-secondary"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>
      }
    >
      <div className="rounded-2xl bg-card p-6 shadow-card">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            {booking.petType === "Cat" ? <Cat className="size-7" /> : <Dog className="size-7" />}
          </div>
          <div>
            <p className="text-lg font-bold">
              {booking.petName} <span className="text-muted-foreground">· {booking.petType}</span>
            </p>
            <StatusPill status={booking.status} />
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <Row label="Owner" value={booking.ownerName} />
          <Row label="Service" value={booking.service} />
          <Row
            label="Appointment"
            value={`${formatDate(booking.date)} · ${formatTime(booking.time)}`}
          />
          <Row label="Price" value={peso(booking.price)} />
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/bookings/$id/edit"
            params={{ id: booking.id }}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-card transition hover:opacity-90"
          >
            Edit
          </Link>
          <button
            onClick={() => setConfirming(true)}
            className="rounded-full bg-destructive/10 px-6 py-2.5 text-sm font-bold text-destructive transition hover:bg-destructive/20"
          >
            Delete
          </button>
        </div>
      </div>

      <DeleteDialog
        booking={confirming ? booking : null}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          remove(booking.id);
          navigate({ to: "/dashboard" });
        }}
      />
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 px-4 py-3">
      <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
