import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { JourneySteps } from "@/components/JourneySteps";
import { configKey } from "@/lib/character";
import { defaultPatternName, savePatternToLibrary, setState, useStore } from "@/lib/store";

export const Route = createFileRoute("/pattern")({
  head: () => ({
    meta: [
      { title: "Your pattern draft — Stitchling" },
      { name: "description", content: "Review, edit, copy and download your generated crochet pattern draft." },
      { property: "og:title", content: "Your pattern draft — Stitchling" },
      { property: "og:description", content: "Edit and export your generated crochet pattern." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PatternPage,
});

function Rendered({ text }: { text: string }) {
  return (
    <div className="pattern-doc">
      {text.split("\n").map((l, i) => {
        if (l.startsWith("# ")) return <h2 key={i} className="font-display text-3xl font-semibold">{l.slice(2)}</h2>;
        if (l.startsWith("## ")) return <h3 key={i} className="mt-6 font-display text-xl font-semibold text-primary">{l.slice(3)}</h3>;
        if (l.startsWith("DRAFT")) return <p key={i} className="alert mt-3 text-sm">{l}</p>;
        if (!l.trim()) return null;
        const m = l.match(/^([^:]{1,14}):\s(.*)$/);
        if (m && !l.startsWith("Note") && !/^\d+\.\s/.test(l)) return (
          <p key={i} className="flex gap-3 border-b border-border/60 py-1.5">
            <span className="w-24 shrink-0 font-semibold">{m[1]}</span>
            <span>{m[2]}</span>
          </p>
        );
        return <p key={i} className={l.startsWith("Note") ? "mt-2 text-sm italic text-muted-foreground" : "py-0.5"}>{l}</p>;
      })}
    </div>
  );
}

function PatternPage() {
  const draft = useStore((s) => s.draft);
  const config = useStore((s) => s.config);
  const library = useStore((s) => s.library);
  const [mode, setMode] = useState<"read" | "edit">("read");
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
    savePatternToLibrary(name);
    setName("");
    navigate({ to: "/my-patterns" });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-6 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/customize" className="btn-ghost" aria-label="Back to character editor"><ArrowLeft size={16} /> Back</Link>
          <Link to="/" className="font-display text-3xl font-semibold">Stitchling</Link>
        </div>
        <JourneySteps active={1} />
      </header>

      {stale && (
        <div className="alert">
          <p>Your character has changed since this pattern was made. Press <strong>Back</strong> at the top left to update it.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-full bg-muted p-1">
          <button className={mode === "read" ? "tab tab-on" : "tab"} onClick={() => setMode("read")}>Read</button>
          <button className={mode === "edit" ? "tab tab-on" : "tab"} onClick={() => setMode("edit")}>Edit</button>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input
            aria-label="Pattern name"
            className="h-9 w-44 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder={defaultPatternName(library)}
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn-ghost" onClick={copy}>Copy</button>
          <button className="btn-ghost" onClick={download}>Download .txt</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>

      <section className="panel">
        {mode === "read" ? (
          <Rendered text={draft.text} />
        ) : (
          <textarea
            aria-label="Edit pattern"
            className="min-h-[70vh] w-full resize-y rounded-xl bg-muted/50 p-4 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
            value={draft.text}
            onChange={(e) => setState((s) => ({ ...s, draft: s.draft && { ...s.draft, initialText: s.draft.initialText ?? s.draft.text, text: e.target.value, edited: true, saved: false } }))}
          />
        )}
      </section>
      {draft.edited && <p className="text-sm text-muted-foreground">Edits are saved automatically on this device.</p>}
      {toast && <div role="status" className="toast">{toast}</div>}
    </main>
  );
}
