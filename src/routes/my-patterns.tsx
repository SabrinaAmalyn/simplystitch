import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AccountLayout } from "@/components/AccountLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useStore } from "@/lib/store";

/** The saved pattern opened by the current address, if this is one of those pages. */
function useOpenPattern() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const library = useStore((s) => s.library);
  const match = /^\/my-patterns\/([^/]+)\/?$/.exec(pathname);
  return match ? library.find((p) => p.id === decodeURIComponent(match[1])) : undefined;
}

export const Route = createFileRoute("/my-patterns")({
  component: MyPatternsLayout,
});

/** Shared shell for the library pages; a single pattern also gets a breadcrumb trail. */
function MyPatternsLayout() {
  const pattern = useOpenPattern();
  return (
    <AccountLayout
      breadcrumb={
        pattern && (
          <Breadcrumb items={[{ label: "My Patterns", to: "/my-patterns" }, { label: pattern.name }]} />
        )
      }
    >
      <Outlet />
    </AccountLayout>
  );
}
