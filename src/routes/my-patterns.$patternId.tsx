import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AccountLayout } from "@/components/AccountLayout";
import { SavedPatternDetail } from "@/components/SavedPatternDetail";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/my-patterns/$patternId")({
  head: () => ({
    meta: [
      { title: "Saved pattern — Stitchling" },
      { name: "description", content: "Read, tick off rounds and download one of your saved Stitchling crochet patterns." },
      { property: "og:title", content: "Saved pattern — Stitchling" },
      { property: "og:description", content: "Your saved Stitchling character and its crochet pattern." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SavedPatternPage,
});

function SavedPatternPage() {
  const { patternId } = Route.useParams();
  const p = useStore((s) => s.library.find((x) => x.id === patternId));
  if (!p) return <Navigate to="/my-patterns" replace />;
  return (
    <AccountLayout>
      <SavedPatternDetail p={p} />
    </AccountLayout>
  );
}
