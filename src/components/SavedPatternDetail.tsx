import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Download, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatternWorkspaceHeader } from "@/components/PatternWorkspaceHeader";
import { PatternDocument } from "@/components/PatternDocument";
import { loadPatternIntoCustomizer, progressKey, renamePattern, type SavedPattern } from "@/lib/store";

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
      className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
    <div className="saved-pattern-workspace">
      <PatternDocument text={p.text} config={p.config} progressKey={progressKey(p.text, p.id)} name={p.name}
        header={<PatternWorkspaceHeader title={p.name}
          back={<Link to="/my-patterns" aria-label="All patterns" title="All patterns"><ArrowLeft /></Link>}
          status="Saved to My Patterns" nameField={<NameField p={p} />}
          actions={<>
            <Button variant="outline" onClick={() => { loadPatternIntoCustomizer(p.id); navigate({ to: "/customize" }); }}><Palette /> Customize</Button>
            <Button variant="outline" onClick={() => downloadPattern(p)}><Download /> Download .txt</Button>
          </>}
        />}
      />
    </div>
  );
}
