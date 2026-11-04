import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { BookOpen, LogIn, LogOut, Menu, ShieldCheck, User } from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";
import { supabase } from "@/integrations/supabase/client";
import { roleLabel, useAuth } from "@/hooks/useAuth";
import { ForcePasswordChange } from "@/components/ForcePasswordChange";

const NAV = [
  { to: "/my-patterns", label: "My Patterns", icon: BookOpen },
  { to: "/profile", label: "My Profile", icon: User },
] as const;

/** Signed-in shell: left sidebar + top bar with the profile picture menu. */
export function AccountLayout({ children, breadcrumb }: { children: ReactNode; breadcrumb?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, roles, isAdmin } = useAuth();
  const navigate = useNavigate();
  async function logOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <ForcePasswordChange />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-hidden border-r border-border bg-card px-4 py-6 transition-transform md:sticky md:top-0 md:bottom-auto md:h-full md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
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
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              activeProps={{ className: "bg-accent text-primary" }}
            >
              <ShieldCheck size={16} /> Team
            </Link>
          )}
        </nav>
        <div className="mt-auto flex flex-col gap-1 pt-4">
          {user ? (
            <>
              <div className="px-3 text-xs text-muted-foreground">{user.email} · {roleLabel(roles)}</div>
              <button onClick={logOut} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-muted">
                <LogOut size={16} /> Log out
              </button>
            </>
          ) : (
            <Link to="/auth" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted">
              <LogIn size={16} /> Log in
            </Link>
          )}
        </div>
      </aside>
      {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-foreground/20 md:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button aria-label="Open menu" className="rounded-lg border border-border p-2 md:hidden" onClick={() => setOpen(true)}>
              <Menu size={18} />
            </button>
            <Link to="/" className="font-logo shrink-0 text-xl uppercase leading-tight md:hidden">SimplyStitch</Link>
            {breadcrumb}
          </div>
          <ProfileMenu />
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
