import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BookingForm, emptyValues } from "@/components/BookingForm";
import { useBookings } from "@/lib/bookings";

function checkAuth() {
  const user = localStorage.getItem("apple-david-user");
  if (!user) {
    throw new Error("Not authenticated");
  }
}

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
  beforeLoad: () => {
    checkAuth();
  },
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
        checkDuplicate={async (v) => await hasDuplicate(v.petName, v.date, v.time)}
        onCancel={() => navigate({ to: "/dashboard" })}
        onSubmit={(v, price) => {
          add({ ...v, status: "Pending", price }).then((booking) => {
            navigate({ to: "/bookings/$id", params: { id: booking.id } });
          });
        }}
      />
    </AppShell>
  );
}
