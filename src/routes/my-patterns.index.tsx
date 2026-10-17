import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CharacterPreview } from "@/components/CharacterPreview";
import { downloadPattern } from "@/components/SavedPatternDetail";
import { deletePattern, loadPatternIntoCustomizer, renamePattern, useStore, type SavedPattern } from "@/lib/store";

export const Route = createFileRoute("/my-patterns/")({
  head: () => ({
    meta: [
      { title: "My Patterns — SimplyStitch" },
      { name: "description", content: "Browse, rename and download your saved amigurumi characters and crochet patterns." },
      { property: "og:title", content: "My Patterns — SimplyStitch" },
      { property: "og:description", content: "Your saved SimplyStitch characters and their crochet patterns." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyPatternsPage,
});

function MyPatternsPage() {
  const library = useStore((s) => s.library);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">My Patterns</h1>

      {library.length === 0 ? (
        <section className="panel text-center">
          <p className="text-muted-foreground">No saved patterns yet. Customize a character, generate its pattern, then press Save.</p>
          <Link to="/customize" className="btn-primary mt-4 inline-flex">Start customizing</Link>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {library.map((p) => (
            <PatternCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function NameField({ p }: { p: SavedPattern }) {
  const [value, setValue] = useState(p.name);
  return (
    <input
      aria-label="Pattern name"
      className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 font-display text-lg font-semibold outline-none hover:border-border focus:border-border focus:bg-card"
      value={value}
      maxLength={60}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => (value.trim() ? renamePattern(p.id, value) : setValue(p.name))}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
    />
  );
}

function PatternCard({ p }: { p: SavedPattern }) {
  const navigate = useNavigate();
  return (
    <article className="panel flex flex-col gap-3">
      <div className="h-56 w-full">
        <CharacterPreview config={p.config} />
      </div>
      <NameField p={p} />
      <p className="px-2 text-xs text-muted-foreground">Saved {new Date(p.savedAt).toLocaleString()}</p>
      <div className="flex flex-wrap gap-2">
        <Link className="btn-primary" to="/my-patterns/$patternId" params={{ patternId: p.id }}>View</Link>
        <button className="btn-ghost" onClick={() => { loadPatternIntoCustomizer(p.id); navigate({ to: "/customize" }); }}>Customize</button>
        <button className="btn-ghost" onClick={() => downloadPattern(p)}>Download</button>
        <button className="btn-ghost" onClick={() => confirm(`Delete "${p.name}"?`) && deletePattern(p.id)}>Delete</button>
      </div>
    </article>
  );
}
