import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/landing/bunny-hero.png";
import aboutImg from "@/assets/landing/bunny-about.png";
import turnImg from "@/assets/landing/bunny-turnaround.png";


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
        <span className="font-rounded text-2xl font-semibold">SimplyStitch</span>
        <nav className="flex items-center gap-2">
          <Link to="/customize" className="btn-primary">Try Demo</Link>
        </nav>
      </header>

      <section className="landing-sky">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:gap-12 md:px-8 md:py-20">
          <div className="flex min-w-0 flex-col items-start gap-5 text-primary-foreground">
            <h1 className="font-rounded text-4xl leading-tight font-bold uppercase md:text-6xl">
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
          <div className="relative mx-auto w-full max-w-[460px]">
            <Heart className="absolute inset-0 m-auto h-full w-full" />
            <img src={heroImg} alt="SimplyStitch bunny waving with a crochet hook" width={1024} height={1024} className="relative w-full" />
          </div>
        </div>
      </section>

      <div className="marquee border-y border-border bg-background py-4" aria-hidden>
        <div className="marquee-track font-rounded text-lg font-semibold text-primary">
          {items.map((t, i) => (
            <span key={i}>✦ {t}</span>
          ))}
        </div>
      </div>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:gap-12 md:px-8 md:py-20">
        <div className="relative mx-auto w-full max-w-[400px]">
          <Heart className="absolute inset-0 m-auto h-full w-full" tone="soft" />
          <img src={aboutImg} alt="SimplyStitch bunny hugging a ball of yarn" width={1024} height={1024} loading="lazy" className="relative w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="font-rounded text-3xl font-bold uppercase text-primary md:text-4xl">About SimplyStitch</h2>
          <p className="text-muted-foreground md:text-lg">
            Amigurumi is made up of simple stitches and familiar shapes. SimplyStitch brings them together to help you
            design your own little characters and turn them into crochet patterns, without having to start from scratch.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 md:px-8">
        <h2 className="font-rounded text-center text-xl font-bold tracking-widest text-primary uppercase">Turnaround</h2>
        <img src={turnImg} alt="The SimplyStitch bunny from front, side and back" width={1920} height={640} loading="lazy" className="mt-6 w-full border-b-2 border-border pb-2" />
      </section>

      <section id="how" className="bg-secondary px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-rounded text-3xl font-bold uppercase text-primary md:text-4xl">How it works</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {HOW.map((s) => (
              <li key={s.n} className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{s.n}</span>
                <h3 className="font-rounded text-xl font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-sky px-4 py-16 text-center text-primary-foreground md:py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
          <h2 className="font-rounded text-3xl font-bold md:text-5xl">A few simple stitches. A character all your own.</h2>
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

/** Soft heart shape behind the mascot, like the style reference. */
function Heart({ className, tone = "white" }: { className?: string; tone?: "white" | "soft" }) {
  return (
    <svg viewBox="0 0 100 92" aria-hidden className={className}>
      <path
        d="M50 90 C20 70 2 52 2 30 C2 14 14 2 29 2 C39 2 46 8 50 15 C54 8 61 2 71 2 C86 2 98 14 98 30 C98 52 80 70 50 90 Z"
        fill={tone === "white" ? "var(--background)" : "var(--landing-sky)"}
      />
    </svg>
  );
}
