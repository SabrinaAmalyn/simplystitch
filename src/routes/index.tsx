import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CharacterPreview } from "@/components/CharacterPreview";
import { CustomizerPanel } from "@/components/CustomizerPanel";
import { JourneySteps } from "@/components/JourneySteps";
import { configKey, DEFAULT_CONFIG } from "@/lib/character";
import { generatePattern, patternToText } from "@/lib/pattern";
import { setState, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stitchling — Design your crochet character" },
      { name: "description", content: "Customize a cute crochet character and instantly get a matching amigurumi pattern draft." },
      { property: "og:title", content: "Stitchling — Design your crochet character" },
      { property: "og:description", content: "Customize a crochet character and generate a matching pattern draft." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const config = useStore((s) => s.config);
  const draft = useStore((s) => s.draft);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stale = draft && draft.configKey !== configKey(config);

  const generate = () => {
    if (draft?.edited && stale && !confirming) return setConfirming(true);
    setConfirming(false);
    setBusy(true);
    setError(null);
    setTimeout(() => {
      try {
        const text = patternToText(generatePattern(config));
        setState((s) => ({
          ...s,
          previous: s.draft?.edited ? s.draft : s.previous,
          draft: { text, configKey: configKey(config), edited: false, generatedAt: Date.now() },
        }));
        navigate({ to: "/pattern" });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong generating the pattern.");
        setBusy(false);
      }
    }, 600);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Stitchling</h1>
        <JourneySteps active={0} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="stage relative flex aspect-square max-h-[560px] items-center justify-center p-6 lg:aspect-auto lg:min-h-[520px]">
          <CharacterPreview config={config} />
          <button type="button" className="btn-ghost absolute right-4 top-4" onClick={() => setState((s) => ({ ...s, config: DEFAULT_CONFIG }))}>
            Reset
          </button>
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">Make it yours</h2>
            <p className="text-muted-foreground">Pick colors, ears, face, body and extras. The pattern follows your choices.</p>
          </div>
          <CustomizerPanel config={config} onChange={(c) => setState((s) => ({ ...s, config: c }))} />

          {confirming && (
            <div className="alert">
              <p className="font-semibold">You've edited your current pattern.</p>
              <p className="text-sm">Generating a new one replaces it. Your edited version stays available to restore on the pattern page.</p>
              <div className="mt-3 flex gap-2">
                <button className="btn-primary" onClick={generate}>Generate anyway</button>
                <button className="btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
              </div>
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-primary btn-lg" onClick={generate} disabled={busy}>
              {busy ? "Stitching your pattern…" : draft ? "Generate new pattern" : "Generate Pattern"}
            </button>
            {draft && (
              <Link to="/pattern" className="btn-ghost">
                {stale ? "Open previous pattern (outdated)" : "Open pattern"}
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
