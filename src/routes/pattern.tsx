import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { configKey } from "@/lib/character";
import { defaultPatternName, progressKey, savePatternToLibrary, setState, updatePatternInLibrary, useStore } from "@/lib/store";
import { PatternReader } from "@/components/PatternReader";
import { PatternWorkspaceHeader } from "@/components/PatternWorkspaceHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  const editingId = useStore((s) => s.editingPatternId);
  const editing = editingId ? library.find((p) => p.id === editingId) : undefined;
  const [naming, setNaming] = useState(false);
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
  const suggested = defaultPatternName(library);

  const openNaming = () => {
    setName(editing ? editing.name : "");
    setNaming(true);
  };

  const confirmUpdate = () => {
    if (!editing) return;
    const id = updatePatternInLibrary(editing.id, name);
    setNaming(false);
    if (id) navigate({ to: "/my-patterns/$patternId", params: { patternId: id } });
  };

  const confirmSave = () => {
    const id = savePatternToLibrary(editing && name.trim() === editing.name ? `${editing.name} (copy)` : name);
    setNaming(false);
    setName("");
    if (id) navigate({ to: "/my-patterns/$patternId", params: { patternId: id } });
    else navigate({ to: "/my-patterns" });
  };

  return (
    <main className="pattern-page">
      <PatternReader text={draft.text} config={config} progressKey={progressKey(draft.text)}
        onTextChange={(text) => setState((s) => ({ ...s, draft: s.draft && { ...s.draft, initialText: s.draft.initialText ?? s.draft.text, text, edited: true, saved: false } }))}

        previewAction={<Button onClick={openNaming}><Save /> Save</Button>}
        previewBack={<Button variant="outline" asChild><Link to="/customize"><ArrowLeft /> Go Back</Link></Button>}
        header={<><div className="review-header"><PatternWorkspaceHeader
          profile
          title={suggested}
        /></div>
        {stale && (
          <div className="alert pattern-stale-alert">
            <p>Your character has changed since this pattern was made. Press <strong>Go Back</strong> at the bottom left to update it.</p>
          </div>
        )}</>}
      />
      {draft.edited && <p className="text-sm text-muted-foreground">Edits are saved automatically on this device.</p>}

      <Dialog open={naming} onOpenChange={setNaming}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editing) confirmUpdate();
              else confirmSave();
            }}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>{editing ? "Save changes" : "Name your pattern"}</DialogTitle>
              {editing && (
                <DialogDescription>
                  You customized “{editing.name}”. Update it (the previous version is kept in its history) or save a separate copy.
                </DialogDescription>
              )}
            </DialogHeader>
            <Input
              aria-label="Pattern name"
              placeholder={suggested}
              value={name}
              maxLength={60}
              autoFocus
              onChange={(e) => setName(e.target.value)}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNaming(false)}>Cancel</Button>
              {editing ? (
                <>
                  <Button type="button" variant="outline" onClick={confirmSave}>Save as new copy</Button>
                  <Button type="submit">Update pattern</Button>
                </>
              ) : (
                <Button type="submit">Save</Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
