import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, DollarSign, Receipt, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payments — SimplyStitch Team" },
      { name: "description", content: "Revenue, subscriptions and transactions for SimplyStitch." },
      { property: "og:title", content: "Payments — SimplyStitch Team" },
      { property: "og:description", content: "Revenue, subscriptions and transactions for SimplyStitch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaymentsPage,
});

const KPIS = [
  { label: "Total revenue", icon: DollarSign },
  { label: "Monthly recurring", icon: RefreshCw },
  { label: "Active subscriptions", icon: CreditCard },
  { label: "Transactions", icon: Receipt },
];

function PaymentsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Revenue, subscriptions and transactions.</p>
      </header>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map(({ label, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">{label} <Icon size={16} /></div>
            <div className="mt-2 text-2xl font-bold">—</div>
          </div>
        ))}
      </div>
      <section className="mt-6 rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3"><h2 className="text-sm font-semibold">Transactions</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>{["Date", "Maker", "Item", "Amount", "Status"].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Payments aren't switched on yet. Transactions will appear here once they are.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
