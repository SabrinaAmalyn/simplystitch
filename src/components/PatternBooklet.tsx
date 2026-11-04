import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CharacterPreview } from "@/components/CharacterPreview";
import { parsePatternText, type ReaderItem, type ReaderSection } from "@/lib/pattern-reader";
import { YARNS } from "@/lib/yarn-palette";
import { limbScale } from "@/lib/limb-lengths";
import type { CharacterConfig } from "@/lib/character";
import type { PartFocus } from "@/components/CharacterPreview";

type Shot = "doll" | Exclude<PartFocus, null>;
const SHOTS: Shot[] = ["doll", "head", "body", "arm", "ears", "tail"];
/** Which 3D close-up shows a pattern piece. */
const focusFor = (title: string): Exclude<PartFocus, null> | null => {
  const t = title.toLowerCase();
  if (t.includes("ear")) return "ears";
  if (t.includes("tail")) return "tail";
  if (t.includes("arm")) return "arm";
  if (t.includes("leg") || t.includes("body")) return "body";
  if (t.includes("head") || t.includes("blush")) return "head";
  return null;
};

const ABBREVIATIONS: [string, string][] = [
  ["R", "round"], ["MR", "magic ring"], ["ch", "chain"], ["st(s)", "stitch(es)"],
  ["sc", "single crochet"], ["inc", "increase (2 sc in 1 st)"], ["dec", "decrease (sc 2 sts together)"],
  ["sl st", "slip stitch"], ["BLO", "back loop only"], ["FLO", "front loop only"],
  ["(…) × n", "repeat (…) n times"], ["(n)", "total stitches on that round"],
];

const yarnHex = (yarn?: string) => {
  if (!yarn) return "#e8dccb";
  const hit = YARNS.filter((y) => yarn.toLowerCase().includes(y.name.toLowerCase())).sort((a, b) => b.name.length - a.name.length)[0];
  return hit?.hex ?? "#e8dccb";
};

/** Simple yarn-tinted silhouette for one crochet piece. */
function PartImage({ title, yarn }: { title: string; yarn?: string | undefined }) {
  const fill = yarnHex(yarn);
  const t = title.toLowerCase();
  const stroke = "rgba(0,0,0,0.18)";
  let shape;
  if (t.includes("head")) shape = <ellipse cx="60" cy="62" rx="48" ry="42" fill={fill} stroke={stroke} strokeWidth="2" />;
  else if (t.includes("leg") || t.includes("body")) shape = <path d="M24 20 h72 q8 0 8 10 v62 q0 14 -14 14 h-60 q-14 0 -14 -14 v-62 q0 -10 8 -10z" fill={fill} stroke={stroke} strokeWidth="2" />;
  else if (t.includes("arm")) shape = <rect x="42" y="12" width="36" height="96" rx="18" fill={fill} stroke={stroke} strokeWidth="2" />;
  else if (t.includes("ear")) shape = <path d="M60 10 C92 30 96 100 60 108 C24 100 28 30 60 10z" fill={fill} stroke={stroke} strokeWidth="2" />;
  else if (t.includes("tail")) shape = <path d="M60 18 C92 40 88 96 60 104 C32 96 28 40 60 18z" fill={fill} stroke={stroke} strokeWidth="2" />;
  else shape = <circle cx="60" cy="60" r="36" fill={fill} stroke={stroke} strokeWidth="2" />;
  return (
    <svg viewBox="0 0 120 120" className="booklet-part-img" aria-hidden="true">
      {shape}
    </svg>
  );
}

function Items({ items }: { items: ReaderItem[] }) {
  return (
    <div className="booklet-rounds">
      {items.map((it, i) => {
        if (it.kind === "row") return <p key={i}><b>{it.row.key.includes(":step") ? `${it.row.badge}.` : /^\d/.test(it.row.badge) ? `R${it.row.badge}:` : `${it.row.badge}:`}</b> {it.row.text}{it.row.count != null && <span className="booklet-count"> [{it.row.count}]</span>}</p>;
        if (it.kind === "group") return <p key={i}><b>R{it.badge}:</b> {it.text}{it.count != null && <span className="booklet-count"> [{it.count}]</span>}</p>;
        if (it.kind === "note") return <p key={i} className="booklet-note">{it.text}</p>;
        if (it.kind === "list") return <ul key={i}>{it.items.map((x, j) => <li key={j}>{x.replace(/^\d+\.\s+/, "")}</li>)}</ul>;
        return <p key={i}>{it.text}</p>;
      })}
    </div>
  );
}

function Page({ n, children, className = "" }: { n?: number; children: React.ReactNode; className?: string }) {
  return (
    <section className={`booklet-page ${className}`}>
      <div className="booklet-card">{children}</div>
      {n != null && <span className="booklet-num">{n}</span>}
    </section>
  );
}

function Booklet({ name, text, config, shots }: { name: string; text: string; config: CharacterConfig; shots: Partial<Record<Shot, string>> }) {
  const image = shots.doll ?? null;
  const doc = useMemo(() => parsePatternText(text), [text]);
  const find = (re: RegExp) => doc.sections.find((s) => re.test(s.title));
  const materials = find(/^materials$/i);
  const assembly = doc.sections.filter((s) => /^assembly|embroider/i.test(s.title));
  const pieces = doc.sections.filter((s) => s.parent === "Instructions" && !/embroider/i.test(s.title));
  const split = pieces.some((s) => /^(left|right)\b/i.test(s.title));
  const difficulty = split || pieces.length > 6 ? "Intermediate" : "Beginner";
  const cm = Math.round(13 * (1 + 0.3 * (limbScale(config, "torso") - 1) + 0.3 * (limbScale(config, "legs") - 1)));
  const title = name.replace(/\s*\(example\)\s*$/i, "");
  const img = image ? <img src={image} alt={`${title} finished doll`} className="booklet-hero" /> : <div className="booklet-hero booklet-hero-empty">Preparing your doll…</div>;
  let n = 1;
  return (
    <div className="booklet">
      <Page className="booklet-cover">
        <h1 className="booklet-title">{title}</h1>
        <p className="booklet-by">Pattern by SimplyStitch</p>
        {img}
        <p className="booklet-mark">SimplyStitch</p>
      </Page>
      <Page n={++n}>
        <h2>Difficulty</h2>
        <p>{difficulty}</p>
        <h2>Materials</h2>
        {materials ? <Items items={materials.items} /> : null}
        <ul className="booklet-list">
          <li>A pair of safety eyes with washers (8–10 mm)</li>
          <li>Tapestry / yarn needle, stitch marker, scissors</li>
          <li>Fiberfill stuffing</li>
        </ul>
        <h2>Yarn &amp; hook size</h2>
        <p>DK / light worsted cotton yarn with a 3.0 mm crochet hook. Your finished doll will be approximately {cm} cm ({(cm / 2.54).toFixed(1)}") tall.</p>
        <h2>Abbreviations</h2>
        <dl className="booklet-abbr">{ABBREVIATIONS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>= {v}</dd></div>)}</dl>
      </Page>
      {pieces.map((s: ReaderSection, i) => (
        <Page n={++n} key={s.id}>
          {i === 0 && <p className="booklet-kicker">{title} pattern</p>}
          <div className="booklet-piece">
            <div>
              <h2>{s.title}</h2>
              {s.yarn && <p className="booklet-yarn">({s.yarn})</p>}
              <Items items={s.items} />
            </div>
            {(() => { const f = focusFor(s.title); const src = f ? shots[f] : undefined; return src ? <img src={src} alt={`${s.title} in 3D`} className="booklet-part-img booklet-part-3d" /> : <PartImage title={s.title} yarn={s.yarn} />; })()}
          </div>
        </Page>
      ))}
      {assembly.length > 0 && (
        <Page n={++n}>
          <h2>Assembly</h2>
          <p className="booklet-note">Use pins to hold each piece in place before sewing. If this doll is for a young child, sew every piece securely rather than gluing.</p>
          {assembly.map((s) => (
            <div key={s.id}>{assembly.length > 1 && <h3>{s.title}</h3>}<Items items={s.items} /></div>
          ))}
        </Page>
      )}
      <Page n={++n} className="booklet-end">
        <h2>And… you're done!</h2>
        {img}
        <p>We hope you had fun making {title}! Share photos of your finished doll and tag <b>#SimplyStitch</b> — we'd love to see your creations.</p>
        <p>Questions or feedback? Design another doll anytime at <b>simplystitch.lovable.app</b>.</p>
        <p className="booklet-mark">SimplyStitch</p>
      </Page>
    </div>
  );
}

/** Print preview of the pattern as a styled booklet; "Print / Save as PDF" uses the browser's print engine. */
export function PatternBookletDialog({ open, onOpenChange, name, text, config }: { open: boolean; onOpenChange: (v: boolean) => void; name: string; text: string; config: CharacterConfig }) {
  const [shots, setShots] = useState<Partial<Record<Shot, string>>>({});
  const next = SHOTS.find((k) => !shots[k]);
  const print = () => {
    document.body.classList.add("print-booklet-mode");
    const done = () => { document.body.classList.remove("print-booklet-mode"); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    window.print();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="booklet-dialog sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Print preview</DialogTitle>
          <DialogDescription>Choose "Save as PDF" in the print window to keep a copy.</DialogDescription>
        </DialogHeader>
        {open && next && (
          <div className="booklet-capture" aria-hidden="true"><CharacterPreview key={next} config={config} focus={next === "doll" ? null : next} onCapture={(url) => setShots((v) => ({ ...v, [next]: url }))} /></div>
        )}
        <div className="booklet-scroll"><Booklet name={name} text={text} config={config} shots={shots} /></div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={print} disabled={!!next}><Printer /> Print / Save as PDF</Button>
        </DialogFooter>
        {open && createPortal(<div className="booklet-print-root"><Booklet name={name} text={text} config={config} shots={shots} /></div>, document.body)}
      </DialogContent>
    </Dialog>
  );
}
