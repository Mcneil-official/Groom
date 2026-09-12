import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BookingForm, valuesFrom } from "@/components/BookingForm";
import { useBookings } from "@/lib/bookings";

export const Route = createFileRoute("/bookings/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Booking — Apple David Pet Grooming" },
      {
        name: "description",
        content: "Update a pet grooming appointment's service, schedule or status.",
      },
      { property: "og:title", content: "Edit Booking — Apple David Pet Grooming" },
      {
        property: "og:description",
        content: "Reschedule or confirm a grooming appointment at Apple David.",
      },
    ],
  }),
  component: EditBooking,
});

function EditBooking() {
  const { id } = useParams({ from: "/bookings/$id/edit" });
  const { get, update, hasDuplicate } = useBookings();
  const navigate = useNavigate();
  const booking = get(id);

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
    <AppShell title="Edit Booking" subtitle={`Booking Code: ${booking.code}`}>
      <BookingForm
        initial={valuesFrom(booking)}
        submitLabel="Save Changes"
        showStatus
        checkDuplicate={(v) => hasDuplicate(v.petName, v.date, v.time, booking.id)}
        onCancel={() => navigate({ to: "/bookings/$id", params: { id: booking.id } })}
        onSubmit={(v, price) => {
          update(booking.id, { ...v, price });
          navigate({ to: "/bookings/$id", params: { id: booking.id } });
        }}
      />
    </AppShell>
  );
}
