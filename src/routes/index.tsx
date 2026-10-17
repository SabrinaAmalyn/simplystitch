import { createFileRoute, Link } from "@tanstack/react-router";
import customiseArt from "@/assets/how-customise.png.asset.json";
import generateArt from "@/assets/how-generate.png.asset.json";
import reviewArt from "@/assets/how-review.png.asset.json";

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
  { n: 1, art: customiseArt.url, title: "Customise", body: "Personalise your character with features, colors, and little details that make it yours." },
  { n: 2, art: generateArt.url, title: "Generate", body: "Turn your design into a step-by-step crochet pattern with stitch counts and assembly instructions." },
  { n: 3, art: reviewArt.url, title: "Review", body: "Review your pattern, track your progress, add notes, and export when you're ready." },
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

      <section className="landing-sky flex min-h-[72vh] items-center px-4 py-16 md:px-8">
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
        <div className="marquee-track font-heavy text-lg uppercase text-primary md:text-2xl">
          {items.map((t, i) => (
            <span key={i} className="flex items-center gap-10 pr-10">
              <span aria-hidden="true" className="text-6xl leading-none md:text-7xl">✿</span>
              <span>{t}</span>
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-4 py-12 text-center md:px-8">
        <h2 className="font-heavy text-2xl uppercase text-primary md:text-4xl">About SimplyStitch</h2>
        <p className="mt-10 text-base text-muted-foreground md:text-lg">
          Amigurumi is made up of simple stitches and familiar shapes. SimplyStitch brings them together to help you
          design your own little characters and turn them into crochet patterns, without having to start from scratch.
        </p>
      </section>

      <section id="how" className="landing-grid flex min-h-[45vh] flex-col justify-center px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="font-heavy text-center text-2xl uppercase text-primary md:text-4xl">How it works</h2>
          <ol className="mt-12 grid gap-14 md:mt-16 md:grid-cols-3 md:gap-8">
            {HOW.map((s) => (
              <li key={s.n} className="flex flex-col items-center text-center">
                <div className="flex h-80 w-full items-center justify-center md:h-96">
                  <img src={s.art} alt={`${s.title} illustration`} className="max-h-full w-auto max-w-full object-contain" />
                </div>
                <h3 className="font-heavy mt-6 text-xl uppercase text-primary md:text-2xl">
                  <span className="mr-2">{s.n}.</span>
                  {s.title}
                </h3>
                <p className="mt-3 max-w-sm text-base leading-relaxed text-muted-foreground md:text-lg">{s.body}</p>
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

      <footer className="border-t border-border px-4 py-5 text-center">
        <p className="text-xs text-muted-foreground">Copyright © 2026 SimplyStitch. All rights reserved.</p>
      </footer>
    </main>
  );
}
