import { createFileRoute, Link } from "@tanstack/react-router";
import { AccountLayout } from "@/components/AccountLayout";
import { useStore } from "@/lib/store";
import { yarnById } from "@/lib/yarn-palette";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Stitchling" },
      { name: "description", content: "Your Stitchling account: saved characters, favourite yarns, stitching preferences and recent activity." },
      { property: "og:title", content: "My Profile — Stitchling" },
      { property: "og:description", content: "Your Stitchling profile: favourite yarns, stitching preferences and recent activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

// Demo account content — sample data shown in the signed-in preview only.
const PROFILE = {
  name: "Sabrina Rizal",
  handle: "@sabrina",
  initials: "SR",
  bio: "Weekend amigurumi maker. Currently working through a very long list of foxes.",
  plan: "Maker Pro",
  email: "sabrina.rizal@example.com",
  location: "Kuala Lumpur, Malaysia",
  joined: "March 2026",
};

const DETAILS = [
  { label: "Email", value: PROFILE.email },
  { label: "Location", value: PROFILE.location },
  { label: "Member since", value: PROFILE.joined },
  { label: "Plan", value: PROFILE.plan },
];

const PREFERENCES = [
  { label: "Written terms", value: "US" },
  { label: "Yarn weight", value: "DK cotton" },
  { label: "Hook size", value: "3.0 mm" },
  { label: "Email digest", value: "Monthly" },
  { label: "Public profile", value: "Off" },
];

const FAVOURITE_YARNS = ["peach", "blush", "sage", "oat"].map(yarnById);

const PROJECT = { name: "Tabby cat", stage: "Body — round 12 of 15", percent: 80 };

const ACTIVITY = [
  { what: "Saved “Fox Red Bunny”", when: "2 days ago" },
  { what: "Edited the pattern for “Tabby cat”", when: "5 days ago" },
  { what: "Generated “Sleepy Bear”", when: "1 week ago" },
];

function ProfilePage() {
  const saved = useStore((s) => s.library).length;
  const stats = [
    { label: "Saved patterns", value: String(saved) },
    { label: "Stitches cast on", value: "12,480" },
    { label: "Yarns used", value: "9" },
    { label: "Finished dolls", value: "6" },
  ];

  return (
    <AccountLayout>
      <div className="flex flex-col gap-6">
        <section className="panel flex flex-col gap-4 md:flex-row md:items-center md:gap-5">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div aria-hidden className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent font-display text-xl font-semibold text-primary">
              {PROFILE.initials}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-semibold">{PROFILE.name}</h1>
              <p className="text-sm text-muted-foreground">{PROFILE.handle} · {PROFILE.plan}</p>
              <p className="mt-2 text-sm">{PROFILE.bio}</p>
            </div>
          </div>
          <Link to="/my-patterns" className="btn-ghost w-full justify-center md:ml-auto md:w-auto">View my patterns</Link>
        </section>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-4">
              <p className="font-display text-2xl font-semibold">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid min-w-0 gap-6 md:grid-cols-2">
          <section className="panel">
            <h2 className="mb-4 font-display text-xl font-semibold">Account details</h2>
            <dl className="flex flex-col gap-3">
              {DETAILS.map((d) => (
                <div key={d.label} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
                  <dt className="text-sm text-muted-foreground">{d.label}</dt>
                  <dd className="text-sm font-semibold">{d.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="panel">
            <h2 className="mb-4 font-display text-xl font-semibold">Stitching preferences</h2>
            <dl className="flex flex-col gap-3">
              {PREFERENCES.map((p) => (
                <div key={p.label} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
                  <dt className="text-sm text-muted-foreground">{p.label}</dt>
                  <dd className="text-sm font-semibold">{p.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="panel">
            <h2 className="mb-4 font-display text-xl font-semibold">Favourite yarns</h2>
            <ul className="flex flex-wrap gap-2">
              {FAVOURITE_YARNS.map((y) => (
                <li key={y.id} className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm">
                  <span aria-hidden className="h-4 w-4 rounded-full border border-border" style={{ background: y.hex }} />
                  {y.name}
                </li>
              ))}
            </ul>
            <h2 className="mt-6 mb-3 font-display text-xl font-semibold">Current project</h2>
            <p className="text-sm font-semibold">{PROJECT.name}</p>
            <p className="text-xs text-muted-foreground">{PROJECT.stage}</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${PROJECT.percent}%` }} />
            </div>
          </section>

          <section className="panel">
            <h2 className="mb-4 font-display text-xl font-semibold">Recent activity</h2>
            <ul className="flex flex-col gap-3">
              {ACTIVITY.map((a) => (
                <li key={a.what} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-sm">{a.what}</span>
                  <span className="text-xs text-muted-foreground">{a.when}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="text-xs text-muted-foreground">This profile shows sample data so you can see how the signed-in area will look.</p>
      </div>
    </AccountLayout>
  );
}
