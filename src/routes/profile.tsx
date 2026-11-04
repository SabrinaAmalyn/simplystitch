import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AccountLayout } from "@/components/AccountLayout";
import { MakerPreferences } from "@/components/MakerPreferences";
import { MakerOnly } from "@/components/MakerOnly";
import { roleLabel, useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { type StashYarn } from "@/lib/maker-insights";
import {
  isSamplePattern,
  memberSinceLabel,
  profileActivity,
  profileDisplayName,
  profileInitials,
  profileStats,
} from "@/lib/profile-info";
import { useStore } from "@/lib/store";
import { yarnById } from "@/lib/yarn-palette";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — SimplyStitch" },
      { name: "description", content: "Your SimplyStitch maker profile, yarn stash and stitching preferences." },
      { property: "og:title", content: "My Profile — SimplyStitch" },
      { property: "og:description", content: "Your maker profile and stitching preferences." },
    ],
  }),
  component: () => (
    <MakerOnly>
      <ProfilePage />
    </MakerOnly>
  ),
});

type ProfileRecord = { display_name: string | null; email: string | null; created_at: string };

function ProfilePage() {
  const { user, roles, loading } = useAuth();
  const library = useStore((s) => s.library);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [yarns, setYarns] = useState<StashYarn[]>([]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setProfile(null);
    setYarns([]);

    void supabase
      .from("profiles")
      .select("display_name, email, created_at")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setProfile(data as ProfileRecord);
      });

    void supabase
      .from("maker_yarns")
      .select("id, color_id, yarn_weight, hook_size, brand")
      .eq("user_id", user.id)
      .order("created_at")
      .then(({ data }) => {
        if (active && data) setYarns(data as StashYarn[]);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const mine = useMemo(
    () => library.filter((pattern) => !isSamplePattern(pattern.id)).sort((a, b) => b.savedAt - a.savedAt),
    [library],
  );
  const stats = profileStats(mine, yarns);
  const recent = profileActivity(mine);
  const name = profileDisplayName({
    profileName: profile?.display_name ?? null,
    metadataName: user?.user_metadata?.["display_name"],
    email: user?.email ?? null,
  });
  const initials = profileInitials(name);
  const joined = memberSinceLabel(profile?.created_at ?? user?.created_at);
  const topColour = stats.topColourId ? yarnById(stats.topColourId).name : "—";

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const cards = [
    { label: "Saved patterns", value: String(stats.savedPatterns) },
    { label: "Yarns listed", value: String(stats.yarnsListed) },
    { label: "Colours used", value: String(stats.coloursUsed) },
    { label: "Most-used colour", value: topColour },
  ];

  return (
    <AccountLayout>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <section className="panel flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div
              aria-hidden
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-semibold text-primary"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-semibold">{name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{user.email} · {roleLabel(roles)}</p>
              <p className="mt-2 text-sm text-muted-foreground">Member since {joined}</p>
            </div>
          </div>
          <Link to="/my-patterns" className="btn-ghost w-full justify-center md:w-auto">
            View my patterns
          </Link>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ label, value }) => (
            <div key={label} className="panel">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
              <div className="mt-1 break-words font-display text-2xl font-semibold">{value}</div>
            </div>
          ))}
        </div>

        <MakerPreferences />

        <section className="panel">
          <h2 className="mb-3 font-display text-xl font-semibold">Recent patterns</h2>
          {recent.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {recent.map(({ id, what, when }) => (
                <li key={id} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="min-w-0 text-sm">{what}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{when}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No saved patterns yet.{" "}
              <Link to="/customize" className="font-semibold text-primary">
                Create your first pattern
              </Link>
              .
            </p>
          )}
        </section>
      </div>
    </AccountLayout>
  );
}
