import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CharacterPreview } from "@/components/CharacterPreview";
import { PatternReader } from "@/components/PatternReader";
import { progressKey, renamePattern, type SavedPattern } from "@/lib/store";

export function downloadPattern(p: SavedPattern) {
  const blob = new Blob([p.text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${p.name.replace(/[^\w\- ]+/g, "").trim() || "pattern"}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
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

/** One saved pattern: name, 3D preview and its interactive pattern. */
export function SavedPatternDetail({ p }: { p: SavedPattern }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1"><NameField p={p} /></div>
        <button className="btn-ghost" onClick={() => navigate({ to: "/my-patterns" })}>All patterns</button>
        <button className="btn-primary" onClick={() => downloadPattern(p)}>Download .txt</button>
      </div>
      <PatternReader text={p.text} config={p.config} progressKey={progressKey(p.text, p.id)} name={p.name} />
    </div>
  );
}
