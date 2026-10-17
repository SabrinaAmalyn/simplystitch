import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

/** A trail step: a link when it has a destination, plain text for the current page. */
export type Crumb = { label: string; to?: "/" | "/my-patterns" | "/profile" };

/** "My Patterns › Bunny" style trail shown in the account top bar. */
export function Breadcrumb({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`account-crumb ${className}`}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span className="account-crumb-item" key={`${item.label}-${i}`}>
            {i > 0 && <ChevronRight className="account-crumb-sep" size={14} aria-hidden="true" />}
            {item.to && !last ? (
              <Link className="account-crumb-link" to={item.to}>{item.label}</Link>
            ) : (
              <span aria-current={last ? "page" : undefined} className="account-crumb-current">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
