import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, MoreVertical, Palette, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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

function RenameDialog({ p, open, onOpenChange }: { p: SavedPattern; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [value, setValue] = useState(p.name);
  useEffect(() => { if (open) setValue(p.name); }, [open, p.name]);
  const save = () => {
    if (value.trim()) renamePattern(p.id, value.trim());
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename pattern</DialogTitle>
          <DialogDescription>Give this pattern a name you will recognise in your library.</DialogDescription>
        </DialogHeader>
        <Input aria-label="Pattern name" value={value} maxLength={60} onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={!value.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** One saved pattern: the pattern document first, with a table of contents beside it. */
export function SavedPatternDetail({ p }: { p: SavedPattern }) {
  const navigate = useNavigate();
  const [renaming, setRenaming] = useState(false);
  return (
    <div className="saved-pattern-workspace">
      <PatternDocument text={p.text} config={p.config} progressKey={progressKey(p.text, p.id)} name={p.name}
        header={<PatternWorkspaceHeader title={p.name}
          back={<Link to="/my-patterns" aria-label="All patterns" title="All patterns"><ArrowLeft /></Link>}
          actions={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Pattern options" title="Pattern options"><MoreVertical /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56">
                <DropdownMenuLabel className="truncate">{p.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setRenaming(true)}><Pencil /> Rename</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { loadPatternIntoCustomizer(p.id); navigate({ to: "/customize" }); }}><Palette /> Customize</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => downloadPattern(p)}><Download /> Download .txt</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />}
      />
      <RenameDialog p={p} open={renaming} onOpenChange={setRenaming} />
    </div>
  );
}
