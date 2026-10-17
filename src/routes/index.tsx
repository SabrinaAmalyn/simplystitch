import { createFileRoute, Link } from "@tanstack/react-router";
import { CharacterPreview } from "@/components/CharacterPreview";
import { createLayeredCharacter } from "@/lib/character-layers";
import { DEFAULT_CONFIG, type CharacterConfig } from "@/lib/character";
import { JourneySteps } from "@/components/JourneySteps";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stitchling — Design a crochet character, get the pattern" },
      { name: "description", content: "Build an amigurumi character from ears, tail, face details and yarn colours, then generate a written crochet pattern draft you can edit and download." },
      { property: "og:title", content: "Stitchling — Design a crochet character, get the pattern" },
      { property: "og:description", content: "Customize your doll, then generate a matching crochet draft with rounds, stitch counts and assembly notes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

/** The doll shown on the landing page — built once, never saved or edited. */
function showcaseConfig(): CharacterConfig {
  const layered = createLayeredCharacter();
  layered.selections.ears = "ears-bunny";
  layered.selections.tail = "tail-round";
  return {
    ...DEFAULT_CONFIG,
    colors: {
      ...DEFAULT_CONFIG.colors,
      main: "peach",
      head: "peach",
      body: "peach",
      leftArm: "peach",
      rightArm: "peach",
      leftLeg: "peach",
      rightLeg: "peach",
      leftEar: "ivory",
      rightEar: "ivory",
      tail: "ivory",
      hands: "ivory",
      feet: "ivory",
      leftBlush: "blush",
      rightBlush: "blush",
    },
    face: {
      ...DEFAULT_CONFIG.face,
      cheeks: true,
      blushShape: "oval",
      nose: "cat",
      mouth: "w",
      eyeStyle: "open",
      brow: "soft-arch",
      whiskers: false,
    },
    layered,
  };
}

const SHOWCASE = showcaseConfig();

const HOW = [
  { n: 1, title: "Customize", body: "Choose ears, tail, embroidered face details and a yarn colour for every part." },
  { n: 2, title: "Review", body: "Get a written draft with rounds, stitch counts and colour switches, then look it over and tweak anything you like." },
  { n: 3, title: "Save", body: "Name it and keep it in My Patterns, where you can copy or download it any time." },
];

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-5 md:px-8">
        <span className="font-display text-2xl font-semibold">Stitchling</span>
        <nav className="flex items-center gap-2">
          <Link to="/my-patterns" className="btn-ghost hidden sm:inline-flex">My Patterns</Link>
          <Link to="/customize" className="btn-primary">Try Demo</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,400px)] md:gap-12 md:px-8 md:py-16">
        <div className="flex min-w-0 flex-col items-start gap-5">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">Amigurumi character studio</p>
          <h1 className="font-display text-4xl leading-tight font-semibold md:text-5xl">
            Make a character.
            <br />
            Get the pattern.
          </h1>
          <p className="max-w-prose text-muted-foreground md:text-lg">
            Pick ears, a tail, embroidered face details and a yarn colour for every part. Stitchling writes a crochet
            draft that matches the doll on your screen — rounds, stitch counts, colour switches and assembly notes.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/customize" className="btn-primary btn-lg">Try Demo</Link>
            <a href="#how" className="btn-ghost">See how it works</a>
          </div>
          <p className="text-sm text-muted-foreground">No sign-up needed. Your character stays in this browser.</p>
        </div>

        <div className="stage overflow-hidden rounded-lg border border-border">
          <div className="h-[320px] w-full md:h-[440px]">
            <CharacterPreview config={SHOWCASE} />
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 pb-14 md:px-8">
        <h2 className="font-display text-2xl font-semibold">How it works</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {HOW.map((s) => (
            <li key={s.n} className="panel flex flex-col gap-2">
              <span className="step-dot step-dot-on">{s.n}</span>
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex justify-center">
          <JourneySteps active={0} size="lg" />
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">Generated drafts are a starting point — edit them, then save what you like.</p>
        <Link to="/customize" className="btn-ghost mt-4 inline-flex">Open the character editor</Link>
      </footer>
    </main>
  );
}
