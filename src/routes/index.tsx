import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail, PawPrint, TriangleAlert } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Log in — Apple David Pet Grooming" },
      {
        name: "description",
        content:
          "Log in to Apple David, the cute and simple pet grooming booking system for owners and groomers.",
      },
      { property: "og:title", content: "Log in — Apple David Pet Grooming" },
      {
        property: "og:description",
        content: "Manage pet grooming appointments with Apple David's simple booking system.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("groomer@appledavid.ph");
  const [password, setPassword] = useState("appledavid123");
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-card shadow-soft md:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-secondary p-10 md:flex">
          <div className="flex items-center gap-2 text-primary">
            <PawPrint className="size-6" />
            <span className="brand-script text-4xl leading-none">Apple David</span>
          </div>
          <div className="my-10 flex flex-1 items-center justify-center">
            <span className="flex size-40 items-center justify-center rounded-full bg-card shadow-card">
              <PawPrint className="size-20 text-primary" />
            </span>
          </div>
          <div>
            <p className="inline-block rounded-full bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground">
              Happy pets, happy owners
            </p>
            <h2 className="mt-4 text-2xl font-bold">
              Fluff, trim and pamper — all booked in one cozy place.
            </h2>
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-8 md:hidden">
            <span className="brand-script text-4xl text-primary">Apple David</span>
          </div>
          <h1 className="text-2xl font-bold">Howdy, Groomer</h1>
          <p className="mt-1 text-sm text-muted-foreground">Let's pamper some pets today.</p>

          <form
            className="mt-8 space-y-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim() || !password.trim()) {
                setError("Email and password are required.");
                return;
              }
              localStorage.setItem("apple-david-user", email);
              navigate({ to: "/dashboard" });
            }}
          >
            <label className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
              <Mail className="size-4 text-muted-foreground" />
              <span className="sr-only">Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <label className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
              <Lock className="size-4 text-muted-foreground" />
              <span className="sr-only">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            {error ? (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <TriangleAlert className="size-3.5 shrink-0" /> {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-card transition hover:opacity-90"
            >
              Start Grooming
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © 2026 Apple David Pet Grooming
          </p>
        </div>
      </div>
    </div>
  );
}
