import { Link } from "@tanstack/react-router";
import { BarChart3, BookOpen, ShieldCheck, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

/** Profile picture menu: maker pages for makers, team console pages for team accounts. */
export function ProfileMenu() {
  const { isAdmin } = useAuth();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open profile menu"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
      >
        <User size={18} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {isAdmin ? (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center gap-2"><BarChart3 size={15} /> Analytics</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/team" className="flex items-center gap-2"><ShieldCheck size={15} /> Team members</Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link to="/my-patterns" className="flex items-center gap-2"><BookOpen size={15} /> My Patterns</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2"><User size={15} /> My Profile</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
