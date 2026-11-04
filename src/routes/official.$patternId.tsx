import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PatternReader } from "@/components/PatternReader";
import { PatternWorkspaceHeader } from "@/components/PatternWorkspaceHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getOfficial, remixOfficial, saveOfficialToLibrary, trackOfficial, type OfficialPattern } from "@/lib/official-patterns";

export const Route = createFileRoute("/official/$patternId")({
  head: () => ({
    meta: [
      { title: "Official pattern — SimplyStitch" },
      { name: "description", content: "An official SimplyStitch amigurumi pattern: read it, save it to My Patterns, or customize it." },
      { property: "og:title", content: "Official pattern — SimplyStitch" },
      { property: "og:description", content: "An official SimplyStitch amigurumi pattern to crochet as-is or make your own." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OfficialPatternPage,
});

function OfficialPatternPage() {
  const { patternId } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState<OfficialPattern | null | undefined>(undefined);
  useEffect(() => { void getOfficial(patternId).then(setP); }, [patternId]);

  if (p === undefined) return <main className="p-10 text-center text-muted-foreground">Loading…</main>;
  if (!p) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">Pattern not available</h1>
        <Link to="/" className="btn-primary">Back to home</Link>
      </main>
    );
  }

  const save = () => {
    if (!user) { navigate({ to: "/auth", search: { mode: "signup" } }); return; }
    trackOfficial(p.id, "download");
    const id = saveOfficialToLibrary(p);
    toast.success("Added to My Patterns");
    navigate({ to: "/my-patterns/$patternId", params: { patternId: id } });
  };
  const customize = () => {
    trackOfficial(p.id, "customize");
    remixOfficial(p);
    navigate({ to: "/customize" });
  };

  return (
    <main className="pattern-page">
      <PatternReader text={p.text} config={p.config} progressKey={`official:${p.id}`}
        previewAction={isAdmin ? undefined : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={customize}>Customize</Button>
            <Button onClick={save}>{user ? "Save to My Patterns" : "Sign up to save"}</Button>
          </div>
        )}
        previewBack={<Button variant="outline" asChild><Link to={isAdmin ? "/admin/showcase" : "/"} aria-label="Go Back"><ArrowLeft /> <span className="max-md:hidden">Go Back</span></Link></Button>}
        header={<div className="review-header"><PatternWorkspaceHeader profile title={`${p.name} · by SimplyStitch`} /></div>}
      />
    </main>
  );
}
