import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type OAuthResult = { data: { redirect_url?: string; redirect_to?: string; client?: { name?: string; uri?: string; client_name?: string }; redirect_uri?: string; scope?: string; user?: { email?: string } } | null; error: { message: string } | null };
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};
const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  head: () => ({ meta: [{ title: "Connect an assistant — SimplyStitch" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s["authorization_id"] === "string" ? s["authorization_id"] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("This connection link is missing its request ID. Start the connection again from your assistant.");
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth", search: { mode: "login", next: location.pathname + location.searchStr } });
    return { email: data.session.user.email ?? "" };
  },
  loaderDeps: ({ search }) => ({ id: search.authorization_id }),
  loader: async ({ deps }) => {
    const { data, error } = await oauth().getAuthorizationDetails(deps.id);
    if (error) throw new Error(error.message || "This connection request has expired. Start again from your assistant.");
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  pendingComponent: () => <Shell><p className="text-sm text-muted-foreground">Loading connection request…</p></Shell>,
  errorComponent: ({ error }) => (
    <Shell>
      <h1 className="text-lg font-semibold">Couldn't load this connection</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error instanceof Error ? error.message : String(error)}</p>
      <Link to="/" className="mt-4 inline-block text-sm font-semibold text-primary">Back to SimplyStitch</Link>
    </Shell>
  ),
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md">
        <p className="font-logo mb-6 text-center text-2xl uppercase">SimplyStitch</p>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">{children}</div>
      </div>
    </div>
  );
}

function Consent() {
  const details = Route.useLoaderData();
  const { email } = Route.useRouteContext();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = details?.client?.name ?? details?.client?.client_name ?? "This assistant";
  const scopes = (details?.scope ?? "").split(/\s+/).filter(Boolean);
  const label = (s: string) => s === "openid" ? "Confirm who you are" : s === "email" ? "Share your email address" : s === "profile" ? "Share your basic profile" : `Additional permission requested: ${s}`;

  async function decide(approve: boolean) {
    setBusy(true); setError(null);
    const { data, error } = approve ? await oauth().approveAuthorization(authorization_id) : await oauth().denyAuthorization(authorization_id);
    if (error) { setBusy(false); setError(error.message || (approve ? "Approval failed." : "Cancelling failed.")); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setError("Something went wrong finishing the connection. Please try again."); return; }
    window.location.href = target;
  }

  return (
    <Shell>
      <h1 className="text-xl font-semibold">Connect {client} to SimplyStitch</h1>
      <p className="mt-2 text-sm text-muted-foreground">Signed in as <strong className="text-foreground">{email}</strong></p>
      <p className="mt-4 text-sm">{client} will be able to read your saved patterns and yarn stash while you are signed in. This lets it use SimplyStitch as you.</p>
      {details?.redirect_uri && <p className="mt-2 break-all text-xs text-muted-foreground">Returns to {details.redirect_uri}</p>}
      {scopes.length > 0 && <ul className="mt-4 list-disc pl-5 text-sm">{scopes.map((s) => <li key={s}>{label(s)}</li>)}</ul>}
      <p className="mt-4 text-xs text-muted-foreground">This does not bypass SimplyStitch's permissions.</p>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-6 flex gap-3">
        <button className="btn-primary flex-1 justify-center" disabled={busy} onClick={() => decide(true)}>Approve</button>
        <button className="flex-1 rounded-lg border border-input px-4 py-2 text-sm font-medium" disabled={busy} onClick={() => decide(false)}>Cancel connection</button>
      </div>
    </Shell>
  );
}
