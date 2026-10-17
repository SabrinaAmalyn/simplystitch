import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AccountLayout } from "@/components/AccountLayout";

export const Route = createFileRoute("/my-patterns")({
  component: () => (
    <AccountLayout>
      <Outlet />
    </AccountLayout>
  ),
});
