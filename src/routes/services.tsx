import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bath,
  Crown,
  PawPrint,
  Scissors,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { SERVICES, peso } from "@/lib/bookings";
import { AppShell } from "@/components/AppShell";

function checkAuth() {
  const user = localStorage.getItem("apple-david-user");
  if (!user) {
    throw new Error("Not authenticated");
  }
}

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Apple David Pet Grooming" },
      {
        name: "description",
        content: "Browse the grooming services and prices offered at Apple David.",
      },
      { property: "og:title", content: "Services — Apple David Pet Grooming" },
      {
        property: "og:description",
        content: "Washes, trims and full grooms at cozy, pet-friendly prices.",
      },
    ],
  }),
  beforeLoad: () => {
    checkAuth();
  },
  component: ServicesPage,
});

const DESCRIPTIONS: Record<string, string> = {
  "Bath & Dry": "A soothing wash, gentle blow-dry and a spritz of fresh scent.",
  "Basic Grooming": "Bath, blow-dry, ear cleaning and a tidy trim to keep them neat.",
  "Full Grooming":
    "The works — bath, haircut, nail trim, and ear and paw care for a fresh new look.",
  "Nail Trimming": "A quick, careful nail clip to keep paws comfy and floors scratch-free.",
};

const ICONS: Record<string, LucideIcon> = {
  "Bath & Dry": Bath,
  "Basic Grooming": Scissors,
  "Full Grooming": Crown,
  "Nail Trimming": Sparkles,
};

function ServicesPage() {
  return (
    <AppShell title="Services & Pricing" subtitle="Every wash, trim and cuddle, priced with love.">
      <div className="grid gap-4 sm:grid-cols-2">
        {SERVICES.map((s) => {
          const Icon = ICONS[s.name] ?? Sparkles;
          return (
            <div key={s.name} className="flex flex-col rounded-2xl bg-card p-5 shadow-card">
              <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold">{s.name}</h2>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                  {peso(s.price)}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {DESCRIPTIONS[s.name] ?? "Ask us about this service."}
              </p>
              <Link
                to="/bookings/new"
                className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-card transition hover:opacity-90"
              >
                Book this <ArrowRight className="size-4" />
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl bg-accent/40 p-5 text-sm text-foreground">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-primary">
          <PawPrint className="size-4" />
        </span>
        <p>
          Not sure which service your pet needs? Message us and we&apos;ll help you pick the perfect
          pamper package.
        </p>
      </div>
    </AppShell>
  );
}
