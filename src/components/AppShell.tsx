import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarHeart, LayoutGrid, LogOut, PawPrint, Plus, Scissors } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
    { to: "/bookings/new", icon: Plus, label: "New Booking" },
    { to: "/services", icon: Scissors, label: "Services" },
    { to: "/calendar", icon: CalendarHeart, label: "Calendar" },
  ] as const;

  const mobileNav = (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
      {navItems.map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary"
          activeProps={{ className: "text-primary" }}
          title={label}
          aria-label={label}
        >
          <Icon className="size-5" />
          <span className="text-[10px] font-semibold">{label.split(" ")[0]}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 overflow-hidden bg-card">
        <aside className="hidden w-20 shrink-0 flex-col items-center gap-6 border-r border-border py-8 md:flex">
          <Link
            to="/dashboard"
            className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            title="Apple David home"
            aria-label="Apple David home"
          >
            <PawPrint className="size-5" />
          </Link>
          <nav className="flex flex-col items-center gap-3">
            <Link
              to="/dashboard"
              className="rounded-2xl p-3 text-sidebar-foreground transition-colors hover:bg-secondary"
              activeProps={{ className: "bg-primary/10 text-primary" }}
              title="Dashboard"
              aria-label="Dashboard"
            >
              <LayoutGrid className="size-5" />
            </Link>
            <Link
              to="/bookings/new"
              className="rounded-2xl p-3 text-sidebar-foreground transition-colors hover:bg-secondary"
              activeProps={{ className: "bg-primary/10 text-primary" }}
              title="New Booking"
              aria-label="New Booking"
            >
              <Plus className="size-5" />
            </Link>
            <Link
              to="/services"
              className="rounded-2xl p-3 text-sidebar-foreground transition-colors hover:bg-secondary"
              activeProps={{ className: "bg-primary/10 text-primary" }}
              title="Services"
              aria-label="Services"
            >
              <Scissors className="size-5" />
            </Link>
            <Link
              to="/calendar"
              className="rounded-2xl p-3 text-sidebar-foreground transition-colors hover:bg-secondary"
              activeProps={{ className: "bg-primary/10 text-primary" }}
              title="Calendar"
              aria-label="Calendar"
            >
              <CalendarHeart className="size-5" />
            </Link>
          </nav>
          <button
            onClick={() => {
              localStorage.removeItem("apple-david-user");
              navigate({ to: "/" });
            }}
            className="mt-auto rounded-2xl p-3 text-muted-foreground transition-colors hover:bg-secondary"
            aria-label="Log out"
          >
            <LogOut className="size-5" />
          </button>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-background/60 p-5 pb-24 md:p-8 md:pb-8">
          <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <PawPrint className="size-5" />
                <span className="brand-script text-3xl leading-none">Apple David</span>
              </div>
              <h1 className="mt-2 text-2xl font-bold">{title}</h1>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            {action}
          </header>
          {children}
        </main>
      </div>
      {mobileNav}
    </div>
  );
}
