import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AccountLayout } from "@/components/AccountLayout";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

/** Team console shell: only admins and super admins get past this gate. */
function AdminLayout() {
  const { loading, isAdmin } = useAuth();
  if (loading) return <AccountLayout><p className="text-sm text-muted-foreground">Loading…</p></AccountLayout>;
  if (!isAdmin) return (
    <AccountLayout>
      <h1 className="text-2xl font-bold">No access</h1>
      <p className="mt-2 text-sm text-muted-foreground">This area is only for the SimplyStitch team.</p>
    </AccountLayout>
  );
  return <AccountLayout><Outlet /></AccountLayout>;
}
