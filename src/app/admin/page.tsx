"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCents } from "@/lib/utils";

type Overview = {
  kpis: {
    families: number;
    fans: number;
    children: number;
    circleMemberships: number;
    cheersCount: number;
    pendingReviews: number;
    payoutCount: number;
    paidOutCents: number;
    gmvCents: number;
    revenueCents: number;
    familiesValueCents: number;
    weekGmvCents: number;
    weekRevenueCents: number;
    weekCheers: number;
    avgCheerCents: number;
    takeRate: number;
  };
  weekly: { weekKey: string; gmv: number; revenue: number; count: number }[];
  byProvider: { provider: string; count: number; gmv: number; revenue: number }[];
};

const WEEK_LABELS = ["this wk", "1 wk", "2 wk", "3 wk", "4 wk", "5 wk", "6 wk", "7 wk"];

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => (await api.get<Overview>("/admin/overview")).data,
    refetchInterval: 15_000,
  });

  if (isLoading || !data) {
    return <p className="text-sm text-stone-400">Loading the console…</p>;
  }

  const { kpis, weekly, byProvider } = data;
  const maxGmv = Math.max(...weekly.map((w) => w.gmv), 1);

  const moneyCards = [
    { label: "Platform revenue — all time", value: formatCents(kpis.revenueCents), sub: `${kpis.cheersCount} funded cheers`, accent: "border-l-taxi-400" },
    { label: "Platform revenue — this week", value: formatCents(kpis.weekRevenueCents), sub: `${kpis.weekCheers} cheers this week`, accent: "border-l-taxi-400" },
    { label: "GMV — all time", value: formatCents(kpis.gmvCents), sub: `families received ${formatCents(kpis.familiesValueCents)}`, accent: "border-l-stone-500" },
    { label: "GMV — this week", value: formatCents(kpis.weekGmvCents), sub: `avg cheer ${formatCents(kpis.avgCheerCents)}`, accent: "border-l-stone-500" },
  ];

  const opsCards = [
    { label: "Families (parents)", value: kpis.families, sub: `${kpis.children} builders` },
    { label: "Family fans", value: kpis.fans, sub: `${kpis.circleMemberships} memberships` },
    { label: "Pending reviews", value: kpis.pendingReviews, sub: "parent moderation queue" },
    { label: "Friday batches run", value: kpis.payoutCount, sub: `${formatCents(kpis.paidOutCents)} distributed` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-taxi-400">Console</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight text-white">
          Platform snapshot
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          Effective take rate: <span className="font-bold text-taxi-300">{(kpis.takeRate * 100).toFixed(1)}%</span>{" "}
          <span className="text-stone-500">(10% fee, capped at {formatCents(5000)})</span>
        </p>
      </div>

      {/* money KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {moneyCards.map((c) => (
          <div key={c.label} className={`rounded-xl border-2 border-black border-l-[6px] bg-[#292620] p-4 ${c.accent}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">{c.label}</p>
            <p className="mt-2 font-display text-2xl tabular-nums tracking-tight text-white">{c.value}</p>
            <p className="mt-1 text-xs text-stone-500">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* weekly GMV bars */}
        <div className="rounded-xl border-2 border-black bg-[#292620] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
            Weekly GMV
          </p>
          <div className="mt-4 flex h-40 items-end gap-2">
            {weekly.map((w, i) => (
              <div key={w.weekKey} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] tabular-nums text-stone-500">
                  {w.gmv > 0 ? (w.gmv / 100).toFixed(0) : ""}
                </span>
                <div
                  className={`w-full rounded-t-md transition-all ${i === 0 ? "bg-taxi-400" : "bg-stone-600"}`}
                  style={{ height: `${Math.max(3, (w.gmv / maxGmv) * 110)}px` }}
                />
                <span className="text-[10px] font-bold uppercase text-stone-500">
                  {WEEK_LABELS[i] === "this wk" ? "this" : WEEK_LABELS[i]}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-stone-500">values in EGP (gross cheer value per week)</p>
        </div>

        {/* by provider */}
        <div className="rounded-xl border-2 border-black bg-[#292620] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
            Volume by provider
          </p>
          <div className="mt-4 space-y-3">
            {byProvider.map((p) => (
              <div key={p.provider} className="rounded-lg bg-black/30 px-3.5 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-white">{p.provider}</span>
                  <span className="text-xs text-stone-400">{p.count} cheers</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-stone-500">GMV {formatCents(p.gmv)}</span>
                  <span className="font-bold text-taxi-300">take {formatCents(p.revenue)}</span>
                </div>
              </div>
            ))}
            {byProvider.length === 0 && (
              <p className="text-sm text-stone-500">No funded cheers yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ops KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {opsCards.map((c) => (
          <div key={c.label} className="rounded-xl border-2 border-black bg-[#292620] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">{c.label}</p>
            <p className="mt-2 font-display text-2xl tabular-nums tracking-tight text-white">{c.value}</p>
            <p className="mt-1 text-xs text-stone-500">{c.sub}</p>
          </div>
        ))}
      </div>

      <a
        href="/admin/revenue"
        className="inline-block rounded-xl border-2 border-taxi-400 bg-transparent px-5 py-2.5 text-sm font-extrabold text-taxi-400 transition-colors hover:bg-taxi-400 hover:text-black"
      >
        Open the revenue ledger →
      </a>
    </div>
  );
}
