import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { describeCharacter } from "@/lib/describe-character.functions";
import { configFromDescription } from "@/lib/describe-character";
import type { CharacterConfig } from "@/lib/character";

const IDEAS = ["Chubby green rabbit with a strawberry hat", "Sleepy grey cat with white paws", "Brown teddy bear with rosy cheeks"];

export function DescribeBar({ onResult }: { onResult: (c: CharacterConfig) => void }) {
  const run = useServerFn(describeCharacter);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "note"; text: string } | null>(null);

  const submit = async (value = text) => {
    if (!value.trim() || busy) return;
    setText(value); setBusy(true); setMessage(null);
    try {
      const { result, error } = await run({ data: { text: value } });
      if (error || !result) setMessage({ kind: "error", text: error ?? "Something went wrong." });
      else {
        onResult(configFromDescription(result));
        if (result.note.trim()) setMessage({ kind: "note", text: result.note });
      }
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Something went wrong." });
    } finally { setBusy(false); }
  };

  return <div className="mt-2 mb-5">
   <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-3">
    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
      <Sparkles size={14} className="text-primary" /> Describe with AI
    </div>
    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <Input value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder="Describe it… e.g. chubby green rabbit" aria-label="Describe your character" disabled={busy} />
      <Button type="submit" disabled={busy || !text.trim()} className="shrink-0 gap-1">
        <Sparkles size={14} />{busy ? "Making…" : "Make it"}
      </Button>
    </form>
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground mr-0.5">Try:</span>
      {IDEAS.map((idea) => <button key={idea} type="button" disabled={busy} onClick={() => void submit(idea)}
        className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">{idea}</button>)}
    </div>
    {message && <p className={`text-xs ${message.kind === "error" ? "text-destructive" : "text-muted-foreground"}`}>{message.text}</p>}
   </div>
    <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" />or customize by hand<div className="h-px flex-1 bg-border" />
    </div>
  </div>;
}
