import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { CharacterPreview } from "@/components/CharacterPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { savedLabel } from "@/lib/relative-time";
import { deletePattern, renamePattern, useStore, type SavedPattern } from "@/lib/store";

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

function PatternCard({ p }: { p: SavedPattern }) {
  const navigate = useNavigate();
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState(p.name);
  const open = () => navigate({ to: "/my-patterns/$patternId", params: { patternId: p.id } });

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Open ${p.name}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          open();
        }
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="pointer-events-none aspect-square w-full border-b border-border">
        <CharacterPreview config={p.config} />
      </div>
      <div className="flex items-start gap-2 p-4">
        <div className="min-w-0 flex-1">
          <h2 className="break-words font-display text-lg font-semibold leading-snug">{p.name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{savedLabel(p.savedAt)}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`More actions for ${p.name}`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="-mr-1 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MoreVertical size={18} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onSelect={() => { setName(p.name); setRenaming(true); }}>
              <Pencil /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setDeleting(true)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={renaming} onOpenChange={setRenaming}>
        <DialogContent onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              renamePattern(p.id, name);
              setRenaming(false);
            }}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>Rename pattern</DialogTitle>
            </DialogHeader>
            <Input aria-label="Pattern name" value={name} maxLength={60} autoFocus onChange={(e) => setName(e.target.value)} />
            {!name.trim() && <p className="text-sm text-destructive">Name can't be empty.</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenaming(false)}>Cancel</Button>
              <Button type="submit" disabled={!name.trim()}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting} onOpenChange={setDeleting}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{p.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This removes the pattern and its progress from My Patterns. This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deletePattern(p.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
