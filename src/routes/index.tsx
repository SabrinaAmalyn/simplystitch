import { createFileRoute, Link } from "@tanstack/react-router";
import { CharacterPreview } from "@/components/CharacterPreview";
import { createLayeredCharacter } from "@/lib/character-layers";
import { DEFAULT_CONFIG, type CharacterConfig } from "@/lib/character";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SimplyStitch — Design a crochet character, get the pattern" },
      { name: "description", content: "Build an amigurumi character from ears, tail, face details and yarn colours, then generate a written crochet pattern draft you can edit and download." },
      { property: "og:title", content: "SimplyStitch — Design a crochet character, get the pattern" },
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
  { n: 1, title: "Customise", body: "You personalise your character with features, colours, and little details that make it yours." },
  { n: 2, title: "Generate", body: "We turn your design into a step-by-step crochet pattern with stitch counts and assembly instructions." },
  { n: 3, title: "Review", body: "You review your pattern, track your progress, make edits, and save when you're ready." },
];

const TICKER = [
  "Custom amigurumi patterns",
  "Row-by-row guides",
  "25 amigurumi yarn colours",
  "Tick off every round",
  "Step-by-step assembly",
];

function Landing() {
  const items = [...TICKER, ...TICKER];
  return (
    <main className="min-h-screen bg-background">
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 md:px-8">
        <span className="font-display text-2xl font-semibold">SimplyStitch</span>
        <nav className="flex items-center gap-2">
          <Link to="/my-patterns" className="btn-ghost hidden sm:inline-flex">My Patterns</Link>
          <Link to="/customize" className="btn-primary">Try Demo</Link>
        </nav>
      </header>

      <section className="landing-sky">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:gap-12 md:px-8 md:py-20">
          <div className="flex min-w-0 flex-col items-start gap-5 text-primary-foreground">
            <h1 className="font-display text-4xl leading-tight font-bold uppercase md:text-6xl">
              Your ideas, made stitch by stitch.
            </h1>
            <p className="max-w-prose md:text-lg">
              Design your own amigurumi character and get a crochet pattern that matches it — rounds, stitch counts and
              colour changes included.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/customize" className="btn-lg inline-flex items-center rounded-full bg-background px-6 font-semibold text-primary">
                Try Demo
              </Link>
              <a href="#how" className="inline-flex items-center rounded-full border border-primary-foreground px-5 py-2 font-semibold">
                See how it works
              </a>
            </div>
          </div>
          <div className="landing-cloud mx-auto aspect-square w-full max-w-[440px] overflow-hidden">
            <CharacterPreview config={SHOWCASE} />
          </div>
        </div>
      </section>

      <div className="marquee border-y border-border bg-background py-4" aria-hidden>
        <div className="marquee-track font-display text-lg font-semibold text-primary">
          {items.map((t, i) => (
            <span key={i}>✦ {t}</span>
          ))}
        </div>
      </div>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:gap-12 md:px-8 md:py-20">
        <div className="landing-sky mx-auto aspect-square w-full max-w-[400px] overflow-hidden rounded-3xl p-6">
          <div className="landing-cloud h-full w-full overflow-hidden">
            <CharacterPreview config={SHOWCASE} />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-3xl font-bold uppercase text-primary md:text-4xl">About SimplyStitch</h2>
          <p className="text-muted-foreground md:text-lg">
            Amigurumi is made up of simple stitches and familiar shapes. SimplyStitch brings them together to help you
            design your own little characters and turn them into crochet patterns, without having to start from scratch.
          </p>
        </div>
      </section>

      <section id="how" className="bg-secondary px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-bold uppercase text-primary md:text-4xl">How it works</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {HOW.map((s) => (
              <li key={s.n} className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{s.n}</span>
                <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-sky px-4 py-16 text-center text-primary-foreground md:py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
          <h2 className="font-display text-3xl font-bold md:text-5xl">A few simple stitches. A character all your own.</h2>
          <p className="md:text-lg">
            You already know the joy of making something by hand. Let SimplyStitch help make designing your next amigurumi
            a little easier.
          </p>
          <Link to="/customize" className="btn-lg inline-flex items-center rounded-full bg-background px-6 font-semibold text-primary">
            Start designing
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">Copyright © 2026 SimplyStitch. All rights reserved.</p>
      </footer>
    </main>
  );
}
