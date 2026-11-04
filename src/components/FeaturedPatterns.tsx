import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CharacterPreview } from "@/components/CharacterPreview";
import { listFeatured, remixOfficial, trackOfficial, trackOnce, type OfficialPattern } from "@/lib/official-patterns";

/** Landing-page grid of official SimplyStitch patterns the team has switched on. */
export function FeaturedPatterns() {
  const [items, setItems] = useState<OfficialPattern[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    void listFeatured().then((list) => {
      setItems(list);
      list.forEach((p) => trackOnce(p.id, "view"));
    });
  }, []);
  if (!items.length) return null;

  return (
    <section className="px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="font-heavy text-center text-2xl uppercase text-primary md:text-4xl">Official patterns</h2>
        <p className="mt-3 text-center text-muted-foreground">Designed by the SimplyStitch team. Crochet them as they are, or make them your own.</p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <div className="h-64 bg-muted"><CharacterPreview config={p.config} /></div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-lg font-bold">{p.name}</h3>
                {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
                  <Link to="/official/$patternId" params={{ patternId: p.id }} onClick={() => trackOfficial(p.id, "click")} className="btn-primary text-center">
                    View pattern
                  </Link>
                  <button type="button" className="btn-ghost" onClick={() => { trackOfficial(p.id, "customize"); remixOfficial(p); navigate({ to: "/customize" }); }}>
                    Customize
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
