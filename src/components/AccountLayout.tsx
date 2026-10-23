import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { BookOpen, LogOut, Menu, User } from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";

const NAV = [
  { to: "/my-patterns", label: "My Patterns", icon: BookOpen },
  { to: "/profile", label: "My Profile", icon: User },
] as const;

/** Demo signed-in shell: left sidebar + top bar with the profile picture menu. */
export function AccountLayout({ children, breadcrumb }: { children: ReactNode; breadcrumb?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-hidden border-r border-border bg-card px-4 py-6 transition-transform md:sticky md:top-0 md:bottom-auto md:h-screen md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Link to="/" onClick={() => setOpen(false)} className="font-logo block text-2xl uppercase leading-tight">SimplyStitch</Link>
        <nav className="mt-6 flex flex-col gap-1">
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
        <div className="mt-auto flex flex-col gap-1 pt-4">
          <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted">
            <LogOut size={16} /> Log out
          </Link>
        </div>
      </aside>
      {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-foreground/20 md:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-card px-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button aria-label="Open menu" className="rounded-lg border border-border p-2 md:hidden" onClick={() => setOpen(true)}>
              <Menu size={18} />
            </button>
            <Link to="/" className="font-logo shrink-0 text-xl uppercase leading-tight md:hidden">SimplyStitch</Link>
            {breadcrumb}
          </div>
          <ProfileMenu />
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
