import type { Status } from "@/lib/bookings";

const tones: Record<Status, string> = {
  Pending: "bg-warning/25 text-warning-foreground",
  Confirmed: "bg-info/25 text-info-foreground",
  Completed: "bg-success/25 text-success-foreground",
  Cancelled: "bg-destructive/15 text-destructive",
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${tones[status]}`}
    >
      {status}
    </span>
  );
}
