import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AccountLayout } from "@/components/AccountLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { MakerOnly } from "@/components/MakerOnly";
import { useStore } from "@/lib/store";

/** The saved pattern opened by the current address, if this is one of those pages. */
function useOpenPattern() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const library = useStore((s) => s.library);
  const id = /^\/my-patterns\/([^/]+)\/?$/.exec(pathname)?.[1];
  return id ? library.find((p) => p.id === decodeURIComponent(id)) : undefined;
}

export const Route = createFileRoute("/my-patterns")({
  component: () => <MakerOnly><MyPatternsLayout /></MakerOnly>,
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
