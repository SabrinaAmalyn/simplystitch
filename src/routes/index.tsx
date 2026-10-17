import { createFileRoute, Link } from "@tanstack/react-router";
import { CustomizeArt, GenerateArt, ReviewArt } from "@/components/HowIllustrations";

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
  { n: 1, Art: CustomizeArt, tags: ["Features", "Colours", "Details"], title: "Customise", body: "You personalise your character with features, colours, and little details that make it yours." },
  { n: 2, Art: GenerateArt, tags: ["Rounds", "Stitch counts", "Assembly"], title: "Generate", body: "We turn your design into a step-by-step crochet pattern with stitch counts and assembly instructions." },
  { n: 3, Art: ReviewArt, tags: ["Track", "Edit", "Save"], title: "Review", body: "You review your pattern, track your progress, make edits, and save when you're ready." },
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
        <Link to="/" className="font-logo text-2xl uppercase">SimplyStitch</Link>
        <nav className="flex items-center gap-2">
          <Link to="/customize" className="btn-primary">Try Demo</Link>
        </nav>
      </header>

      <section className="landing-sky flex min-h-[82vh] items-center px-4 py-16 md:px-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center text-primary-foreground">
          <h1 className="font-heavy text-4xl leading-[1.02] uppercase md:text-6xl">
            Your ideas, made stitch by stitch.
          </h1>
          <p className="max-w-prose text-base md:text-lg">
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
      </section>

      <div className="marquee border-y border-border bg-background py-4" aria-hidden>
        <div className="marquee-track font-heavy text-sm uppercase text-primary">
          {items.map((t, i) => (
            <span key={i} className="flex items-center gap-10 pr-10">
              <span aria-hidden="true">✿</span>
              <span>{t}</span>
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto flex min-h-[42vh] max-w-3xl flex-col items-center justify-center px-4 py-12 text-center md:px-8">
        <h2 className="font-heavy text-2xl uppercase text-primary md:text-4xl">About SimplyStitch</h2>
        <p className="mt-10 text-base text-muted-foreground md:text-lg">
          Amigurumi is made up of simple stitches and familiar shapes. SimplyStitch brings them together to help you
          design your own little characters and turn them into crochet patterns, without having to start from scratch.
        </p>
      </section>

      <section id="how" className="landing-grid px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heavy text-center text-2xl uppercase text-primary md:text-4xl">How it works</h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3">
            {HOW.map(({ n, Art, title, body, tags }) => (
              <li key={n} className="flex flex-col items-center text-center">
                <div className="w-48 md:w-56"><Art /></div>
                <h3 className="font-heavy mt-4 text-xl uppercase text-primary">{n}. {title}</h3>
                <p className="mt-1 text-xs font-semibold text-primary/80">{tags.join(" ✦ ")}</p>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-sky px-4 py-8 text-center text-primary-foreground md:py-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <h2 className="font-heavy text-2xl leading-tight uppercase md:text-4xl">
            A few simple stitches. A character all your own.
          </h2>
          <p className="text-sm md:text-base">
            Let SimplyStitch help make designing your next amigurumi a little easier.
          </p>
          <Link to="/customize" className="btn-lg inline-flex items-center rounded-full bg-background px-6 font-semibold text-primary">
            Start designing
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-3 text-center">
        <p className="text-sm text-muted-foreground">Copyright © 2026 SimplyStitch. All rights reserved.</p>
      </footer>
    </main>
  );
}
