import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { configKey } from "@/lib/character";
import { defaultPatternName, progressKey, savePatternToLibrary, setState, useStore } from "@/lib/store";
import { PatternReader } from "@/components/PatternReader";
import { PatternWorkspaceHeader } from "@/components/PatternWorkspaceHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pattern")({
  head: () => ({
    meta: [
      { title: "Your pattern draft — SimplyStitch" },
      { name: "description", content: "Review and edit your generated crochet pattern draft." },
      { property: "og:title", content: "Your pattern draft — SimplyStitch" },
      { property: "og:description", content: "Review and edit your generated crochet pattern." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PatternPage,
});

function PatternPage() {
  const draft = useStore((s) => s.draft);
  const config = useStore((s) => s.config);
  const library = useStore((s) => s.library);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  if (!draft) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-display text-3xl font-semibold">No pattern yet</h1>
        <p className="text-muted-foreground">Customize your character first, then press Generate.</p>
        <Link to="/customize" className="btn-primary">Go to customizer</Link>
      </main>
    );
  }

  const stale = draft.configKey !== configKey(config);

  const save = () => {
    const id = savePatternToLibrary(name);
    setName("");
    if (id) navigate({ to: "/my-patterns/$patternId", params: { patternId: id } });
    else navigate({ to: "/my-patterns" });
  };

  return (
    <main className="pattern-page">
      <PatternReader text={draft.text} config={config} progressKey={progressKey(draft.text)}
        onTextChange={(text) => setState((s) => ({ ...s, draft: s.draft && { ...s.draft, initialText: s.draft.initialText ?? s.draft.text, text, edited: true, saved: false } }))}

        previewAction={<Button onClick={save}><Save /> Save</Button>}
        previewBack={<Button variant="outline" asChild><Link to="/customize"><ArrowLeft /> Go Back</Link></Button>}
        previewName={<input aria-label="Pattern name" className="review-name-input" placeholder={defaultPatternName(library)} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />}
        header={<><PatternWorkspaceHeader
          profile
          title={name.trim() || defaultPatternName(library)}
        />
        {stale && (
          <div className="alert pattern-stale-alert">
            <p>Your character has changed since this pattern was made. Press <strong>Go Back</strong> at the bottom left to update it.</p>
          </div>
        )}</>}
      />
      {draft.edited && <p className="text-sm text-muted-foreground">Edits are saved automatically on this device.</p>}
    </main>
  );
}
