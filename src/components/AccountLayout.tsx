import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ArrowLeft, BookOpen, Menu, User } from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";

const NAV = [
  { to: "/my-patterns", label: "My Patterns", icon: BookOpen },
  { to: "/profile", label: "My Profile", icon: User },
] as const;

/** Demo signed-in shell: left sidebar + top bar with the profile picture menu. */
export function AccountLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border bg-card px-4 py-6 transition-transform md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Link to="/" className="px-2 font-display text-2xl font-semibold">Stitchling</Link>
        <p className="mt-8 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Menu</p>
        <nav className="mt-2 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              activeProps={{ className: "bg-accent text-primary" }}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
        <Link to="/customize" className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
          <ArrowLeft size={16} /> Back to customizer
        </Link>
      </aside>
      {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-foreground/20 md:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:justify-end md:px-6">
          <button aria-label="Open menu" className="rounded-lg border border-border p-2 md:hidden" onClick={() => setOpen(true)}>
            <Menu size={18} />
          </button>
          <ProfileMenu />
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
