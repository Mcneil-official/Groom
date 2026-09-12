import { useState, type ReactNode } from "react";
import {
  CalendarDays,
  PawPrint,
  ReceiptText,
  Scissors,
  Tag,
  TriangleAlert,
  User,
  type LucideIcon,
} from "lucide-react";
import {
  PET_TYPES,
  SERVICES,
  STATUSES,
  formatDate,
  formatTime,
  peso,
  priceFor,
  type Booking,
  type Status,
} from "@/lib/bookings";

export type FormValues = {
  ownerName: string;
  petName: string;
  petType: string;
  service: string;
  date: string;
  time: string;
  status: Status;
};

export const emptyValues: FormValues = {
  ownerName: "",
  petName: "",
  petType: "",
  service: "",
  date: "",
  time: "",
  status: "Pending",
};

export function valuesFrom(b: Booking): FormValues {
  return {
    ownerName: b.ownerName,
    petName: b.petName,
    petType: b.petType,
    service: b.service,
    date: b.date,
    time: b.time,
    status: b.status,
  };
}

const nameRe = /^[A-Za-z][A-Za-z\s.'-]*$/;

export function validate(v: FormValues, duplicate: boolean) {
  const e: Partial<Record<keyof FormValues | "duplicate", string>> = {};

  if (!v.ownerName.trim()) e.ownerName = "Owner name is required.";
  else if (!nameRe.test(v.ownerName.trim()))
    e.ownerName = "Owner name can only contain letters and spaces.";

  if (!v.petName.trim()) e.petName = "Pet name is required.";
  else if (!nameRe.test(v.petName.trim()))
    e.petName = "Pet name can only contain letters and spaces.";

  if (!v.petType) e.petType = "Pet type is required.";
  if (!v.service) e.service = "Service is required.";
  else if (priceFor(v.service) <= 0) e.service = "Price must be greater than ₱0.";

  if (!v.date) e.date = "Appointment date is required.";
  else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(`${v.date}T00:00:00`) < today) e.date = "Appointment date cannot be in the past.";
  }

  if (!v.time) e.time = "Appointment time is required.";

  if (duplicate) e.duplicate = "This pet already has a booking at this date and time.";

  return e;
}

const field =
  "w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25";

export function BookingForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  checkDuplicate,
  showStatus,
}: {
  initial: FormValues;
  submitLabel: string;
  onSubmit: (v: FormValues, price: number) => void;
  onCancel: () => void;
  checkDuplicate: (v: FormValues) => boolean;
  showStatus?: boolean;
}) {
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const price = priceFor(values.service);

  const set = (k: keyof FormValues, val: string) =>
    setValues((prev) => ({ ...prev, [k]: val }) as FormValues);

  return (
    <form
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        const e = validate(values, checkDuplicate(values));
        setErrors(e);
        if (Object.keys(e).length === 0) onSubmit(values, price);
      }}
      className="space-y-6"
    >
      {errors.duplicate ? (
        <p className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          <TriangleAlert className="size-4 shrink-0" /> {errors.duplicate}
        </p>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid min-w-0 content-start gap-6 xl:grid-cols-2">
          <Section title="Owner Information" icon={User}>
            <Field label="Owner Name" error={errors.ownerName} className="sm:col-span-2">
              <input
                className={field}
                placeholder="Maria Santos"
                value={values.ownerName}
                onChange={(e) => set("ownerName", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Pet Information" icon={PawPrint}>
            <Field label="Pet Name" error={errors.petName}>
              <input
                className={field}
                placeholder="Mochi"
                value={values.petName}
                onChange={(e) => set("petName", e.target.value)}
              />
            </Field>
            <Field label="Pet Type" error={errors.petType}>
              <select
                className={field}
                value={values.petType}
                onChange={(e) => set("petType", e.target.value)}
              >
                <option value="">Select pet type</option>
                {PET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Grooming" icon={Scissors}>
            <Field label="Service" error={errors.service}>
              <select
                className={field}
                value={values.service}
                onChange={(e) => set("service", e.target.value)}
              >
                <option value="">Select a service</option>
                {SERVICES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} — {peso(s.price)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Price">
              <div className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-primary">
                {price > 0 ? peso(price) : "—"}
              </div>
            </Field>
          </Section>

          <Section title="Appointment" icon={CalendarDays}>
            <Field label="Date" error={errors.date}>
              <input
                type="date"
                className={field}
                value={values.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </Field>
            <Field label="Time" error={errors.time}>
              <input
                type="time"
                className={field}
                value={values.time}
                onChange={(e) => set("time", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Status" icon={Tag} className="xl:col-span-2">
            {showStatus ? (
              <Field label="Status" className="sm:col-span-2">
                <select
                  className={field}
                  value={values.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <Field label="Status" className="sm:col-span-2">
                <div className="rounded-xl bg-warning/25 px-4 py-2.5 text-sm font-semibold text-warning-foreground">
                  Pending (default)
                </div>
              </Field>
            )}
          </Section>
        </div>

        <aside className="sticky top-6 hidden lg:block">
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ReceiptText className="size-4" />
              </span>
              Booking Summary
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <SummaryRow
                label="Pet"
                value={
                  values.petName.trim()
                    ? `${values.petName.trim()}${values.petType ? ` · ${values.petType}` : ""}`
                    : "—"
                }
              />
              <SummaryRow
                label="Owner"
                value={values.ownerName.trim() ? values.ownerName.trim() : "—"}
              />
              <SummaryRow label="Service" value={values.service ? values.service : "—"} />
              <SummaryRow
                label="Schedule"
                value={
                  values.date
                    ? `${formatDate(values.date)}${values.time ? ` · ${formatTime(values.time)}` : ""}`
                    : "—"
                }
              />
              <SummaryRow label="Status" value={values.status} />
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm font-semibold text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-primary">
                {price > 0 ? peso(price) : "—"}
              </span>
            </div>
            <button
              type="submit"
              className="mt-4 w-full rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-card transition hover:opacity-90"
            >
              {submitLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="mt-2 w-full rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap gap-3 pt-2 lg:hidden">
        <button
          type="submit"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-card transition hover:opacity-90"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  icon: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-2xl bg-card p-5 shadow-card ${className ?? ""}`}>
      <h2 className="mb-4 flex items-center gap-2.5 text-sm font-bold tracking-wide text-muted-foreground uppercase">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block space-y-1.5 ${className ?? ""}`}>
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {error ? (
        <span className="flex items-center gap-1 text-xs font-semibold text-destructive">
          <TriangleAlert className="size-3.5 shrink-0" /> {error}
        </span>
      ) : null}
    </label>
  );
}
