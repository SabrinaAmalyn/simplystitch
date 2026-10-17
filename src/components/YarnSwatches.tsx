import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { YARN_GROUPS, type Yarn, type YarnGroup } from "@/lib/yarn-palette";

export function YarnSwatches({ label, current, onSelect, groups = YARN_GROUPS, defaultOpen = false }: {
  label: string;
  current: Yarn;
  onSelect: (id: string) => void;
  groups?: YarnGroup[] | undefined;
  defaultOpen?: boolean;
}) {
  return <details open={defaultOpen || undefined} className="min-w-0 border-b border-border pb-2">
    <summary className="cursor-pointer text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {label} <span className="font-normal text-muted-foreground">· {current.name}</span>
    </summary>
    <TooltipProvider delayDuration={200}>
      <div className="mt-2 flex max-h-48 flex-col gap-3 overflow-y-auto px-1 py-1" aria-label={`${label} yarn colours`}>
        {groups.map((group) => <div key={group.name} role="group" aria-label={group.name}>
          <p className="mb-2 text-xs text-muted-foreground">{group.name}</p>
          <div className="flex flex-wrap gap-2">
            {group.yarns.map((yarn) => <Tooltip key={yarn.id}>
              <TooltipTrigger asChild>
                <Button variant="ghost" type="button" aria-label={`${label}: ${yarn.name}`} aria-pressed={current.id === yarn.id}
                  onClick={() => onSelect(yarn.id)}
                  className={`h-8 w-8 shrink-0 rounded-full border border-border p-0 transition focus-visible:ring-offset-2 ${current.id === yarn.id ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : ""}`}
                  style={{ backgroundColor: yarn.hex }} />
              </TooltipTrigger>
              <TooltipContent>{yarn.name}</TooltipContent>
            </Tooltip>)}
          </div>
        </div>)}
      </div>
    </TooltipProvider>
  </details>;
}