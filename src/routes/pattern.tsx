import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Download, Save } from "lucide-react";
import { JourneySteps } from "@/components/JourneySteps";
import { configKey } from "@/lib/character";
import { defaultPatternName, progressKey, savePatternToLibrary, setState, useStore } from "@/lib/store";
import { PatternReader } from "@/components/PatternReader";
import { PatternWorkspaceHeader } from "@/components/PatternWorkspaceHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pattern")({
  head: () => ({
    meta: [
      { title: "Your pattern draft — SimplyStitch" },
      { name: "description", content: "Review, edit, copy and download your generated crochet pattern draft." },
      { property: "og:title", content: "Your pattern draft — SimplyStitch" },
      { property: "og:description", content: "Edit and export your generated crochet pattern." },
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
  const [toast, setToast] = useState<string | null>(null);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

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

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(draft.text);
      setToast("Copied to clipboard");
    } catch {
      setToast("Couldn't copy — select the text and copy manually");
    }
  };
  const download = () => {
    const blob = new Blob([draft.text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "crochet-pattern-draft.txt";
    a.click();
    URL.revokeObjectURL(a.href);
    setToast("Download started");
  };

  const save = () => {
    const id = savePatternToLibrary(name);
    setName("");
    if (id) navigate({ to: "/my-patterns/$patternId", params: { patternId: id } });
    else navigate({ to: "/my-patterns" });
  };

  return (
    <main className="pattern-page">
      <PatternReader text={draft.text} config={config} progressKey={progressKey(draft.text)} name={name.trim() || undefined}
        
        previewAction={<Button onClick={save}><Save /> Save</Button>}
        header={<><PatternWorkspaceHeader
          profile
          center={<JourneySteps active={1} />}
          title={name.trim() || defaultPatternName(library)}
          back={<Link to="/customize" aria-label="Back to character editor" title="Back to character editor"><ArrowLeft /></Link>}
          status={draft.saved ? "Saved to My Patterns" : draft.edited ? "Changes kept on this device" : "Draft · Not saved"}
          nameField={<input aria-label="Pattern name" className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder={defaultPatternName(library)} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />}
          actions={<>
            <Button variant="ghost" size="icon" onClick={copy} aria-label="Copy pattern" title="Copy pattern"><Copy /></Button>
            <Button variant="outline" size="icon" onClick={download} aria-label="Download .txt" title="Download .txt"><Download /></Button>
          </>}
        />
        {stale && (
          <div className="alert pattern-stale-alert">
            <p>Your character has changed since this pattern was made. Press <strong>Back</strong> at the top left to update it.</p>
          </div>
        )}</>}
        editing={<section className="reader-editor">
          <textarea
            aria-label="Edit pattern"
            className="min-h-[60vh] w-full resize-y rounded-lg border border-border bg-background p-4 font-sans text-base leading-relaxed outline-none focus:ring-2 focus:ring-ring"
            value={draft.text}
            onChange={(e) => setState((s) => ({ ...s, draft: s.draft && { ...s.draft, initialText: s.draft.initialText ?? s.draft.text, text: e.target.value, edited: true, saved: false } }))}
          />
        </section>}
      />
      {draft.edited && <p className="text-sm text-muted-foreground">Edits are saved automatically on this device.</p>}
      {toast && <div role="status" className="toast">{toast}</div>}
    </main>
  );
}
