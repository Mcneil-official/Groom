import { Trash2 } from "lucide-react";
import type { Booking } from "@/lib/bookings";

export function DeleteDialog({
  booking,
  onCancel,
  onConfirm,
}: {
  booking: Booking | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-soft">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Trash2 className="size-6" />
        </div>
        <h2 className="mt-3 text-lg font-bold">Delete booking?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you sure you want to delete booking {booking.code} for {booking.petName}?
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-destructive px-5 py-2 text-sm font-bold text-destructive-foreground transition hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
