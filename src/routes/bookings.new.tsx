import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BookingForm, emptyValues } from "@/components/BookingForm";
import { useBookings } from "@/lib/bookings";

export const Route = createFileRoute("/bookings/new")({
  head: () => ({
    meta: [
      { title: "Create Booking — Apple David Pet Grooming" },
      {
        name: "description",
        content: "Book a grooming appointment: owner details, pet details, service and schedule.",
      },
      { property: "og:title", content: "Create Booking — Apple David Pet Grooming" },
      {
        property: "og:description",
        content: "Schedule a bath, trim or full groom for your pet in a few taps.",
      },
    ],
  }),
  component: NewBooking,
});

function NewBooking() {
  const { add, hasDuplicate } = useBookings();
  const navigate = useNavigate();

  return (
    <AppShell title="Create Booking" subtitle="Let's get this pet pampered.">
      <BookingForm
        initial={emptyValues}
        submitLabel="Save Booking"
        checkDuplicate={(v) => hasDuplicate(v.petName, v.date, v.time)}
        onCancel={() => navigate({ to: "/dashboard" })}
        onSubmit={(v, price) => {
          const booking = add({ ...v, status: "Pending", price });
          navigate({ to: "/bookings/$id", params: { id: booking.id } });
        }}
      />
    </AppShell>
  );
}
