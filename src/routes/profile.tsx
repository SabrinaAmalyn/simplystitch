import { createFileRoute } from "@tanstack/react-router";
import { AccountLayout } from "@/components/AccountLayout";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Stitchling" },
      { name: "description", content: "Your Stitchling profile." },
      { property: "og:title", content: "My Profile — Stitchling" },
      { property: "og:description", content: "Your Stitchling profile and account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AccountLayout>
      <h1 className="font-display text-2xl font-semibold">My Profile</h1>
    </AccountLayout>
  );
}
