import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { configKey } from "@/lib/character";
import { defaultPatternName, progressKey, savePatternToLibrary, updatePatternInLibrary, useStore } from "@/lib/store";
import { PatternReader } from "@/components/PatternReader";
import { PatternWorkspaceHeader } from "@/components/PatternWorkspaceHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MakerOnly } from "@/components/MakerOnly";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { createOfficial } from "@/lib/official-patterns";

export const Route = createFileRoute("/pattern")({
  head: () => ({
    meta: [
      { title: "Your pattern draft — SimplyStitch" },
      { name: "description", content: "Preview your generated crochet pattern and each piece before saving it." },
      { property: "og:title", content: "Your pattern draft — SimplyStitch" },
      { property: "og:description", content: "Preview your generated crochet pattern and each piece before saving it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <MakerOnly allowTeam><PatternPage /></MakerOnly>,
});

function PatternPage() {
  const { isAdmin } = useAuth();
  if (isAdmin) return <TeamPatternPage />;
  return <MakerPatternPage />;
}

/** Team draft view: saves become official patterns, optionally shown on the landing page. */
function TeamPatternPage() {
  const draft = useStore((s) => s.draft);
  const config = useStore((s) => s.config);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!draft) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-display text-3xl font-semibold">No pattern yet</h1>
        <p className="text-muted-foreground">Customize a character first, then press Generate.</p>
        <Link to="/customize" className="btn-primary">Go to customizer</Link>
      </main>
    );
  }

  const save = async () => {
    if (!user || !name.trim()) return;
    setBusy(true);
    try {
      await createOfficial({ name: name.trim(), description: description.trim(), config, text: draft.text, featured, userId: user.id });
      toast.success(featured ? "Saved and shown on the landing page" : "Saved as a hidden official pattern");
      navigate({ to: "/admin/showcase" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
      setBusy(false);
    }
  };

  return (
    <main className="pattern-page">
      <PatternReader text={draft.text} config={config} progressKey={progressKey(draft.text)}
        previewAction={<Button onClick={() => setOpen(true)}>Save as official</Button>}
        previewBack={<Button variant="outline" asChild><Link to="/customize" aria-label="Go Back"><ArrowLeft /> <span className="max-md:hidden">Go Back</span></Link></Button>}
        header={<><div className="review-header"><PatternWorkspaceHeader profile title="Official pattern draft" /></div>
          <div className="alert pattern-stale-alert"><p>Team mode — nothing you make here counts towards maker statistics.</p></div></>}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Save official pattern</DialogTitle>
              <DialogDescription>Leave it off the landing page if you're only testing.</DialogDescription>
            </DialogHeader>
            <Input aria-label="Pattern name" placeholder="e.g. Berry Bunny" value={name} maxLength={60} autoFocus required onChange={(e) => setName(e.target.value)} />
            <Textarea aria-label="Short description" placeholder="Short description (optional)" value={description} maxLength={200} onChange={(e) => setDescription(e.target.value)} />
            <label className="flex items-center justify-between gap-3 text-sm font-medium">
              Show on landing page
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy || !name.trim()}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function MakerPatternPage() {
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
        previewAction={<Button onClick={openNaming} aria-label="Save">Save</Button>}
        previewBack={<Button variant="outline" asChild><Link to="/customize" aria-label="Go Back"><ArrowLeft /> <span className="max-md:hidden">Go Back</span></Link></Button>}
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
