"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCents } from "@/lib/utils";

type Row = {
  id: string;
  amountCents: number;
  feeCents: number;
  netCents: number;
  currency: string;
  provider: string;
  providerRef: string | null;
  status: string;
  weekKey: string;
  createdAt: string;
  paidAt: string | null;
  message: string | null;
  child: { firstName: string; parent: { name: string; email: string } };
  donor: { name: string; email: string };
};

const STATUS_STYLE: Record<string, string> = {
  PAID_OUT: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30",
  PENDING_PAYOUT: "bg-taxi-400/10 text-taxi-300 ring-taxi-400/30",
  PENDING_PAYMENT: "bg-sky-400/10 text-sky-300 ring-sky-400/30",
  FAILED: "bg-flame-500/10 text-flame-400 ring-flame-500/30",
};

export default function AdminRevenuePage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "revenue"],
    queryFn: async () => (await api.get<{ ledger: Row[] }>("/admin/revenue")).data,
    refetchInterval: 15_000,
  });

  const rows = (data?.ledger ?? []).filter(
    (r) => statusFilter === "ALL" || r.status === statusFilter
  );

  const sums = rows.reduce(
    (acc, r) => ({
      gmv: acc.gmv + r.amountCents,
      fee: acc.fee + r.feeCents,
      net: acc.net + r.netCents,
    }),
    { gmv: 0, fee: 0, net: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-taxi-400">Audit</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight text-white">
            Revenue ledger
          </h1>
          <p className="mt-1 text-sm text-stone-400">
            Every cheer: what the fan paid, what FC-Junior kept, what the family receives.
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border-2 border-black bg-[#292620] px-3 py-2 text-sm font-semibold text-stone-200 focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING_PAYOUT">In jars</option>
          <option value="PAID_OUT">Paid out</option>
          <option value="PENDING_PAYMENT">At checkout</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border-2 border-black bg-[#292620]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-black/40 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                <th className="px-4 py-3">Cheer</th>
                <th className="px-4 py-3">Fan → Builder</th>
                <th className="px-4 py-3 text-right">Gross</th>
                <th className="px-4 py-3 text-right">FC-Junior fee</th>
                <th className="px-4 py-3 text-right">Family net</th>
                <th className="px-4 py-3">Via</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/60">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-stone-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-stone-500">
                    No cheers match this filter.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="text-stone-300">
                  <td className="px-4 py-3">
                    <p className="font-mono text-[11px] text-stone-500">{r.id.slice(-8)}</p>
                    {r.message && (
                      <p className="mt-0.5 max-w-[200px] truncate text-xs text-stone-400">
                        “{r.message}”
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className="font-semibold text-stone-200">{r.donor.name}</p>
                    <p className="text-stone-500">→ {r.child.firstName} ({r.child.parent.name})</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-white">
                    {formatCents(r.amountCents)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums text-taxi-300">
                    {formatCents(r.feeCents)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-stone-300">
                    {formatCents(r.netCents)}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-stone-400">{r.provider}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide ring-1 ring-inset ${
                        STATUS_STYLE[r.status] ?? "bg-stone-700 text-stone-300 ring-stone-600"
                      }`}
                    >
                      {r.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-500">
                    {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    <p className="text-[10px]">{r.weekKey}</p>
                  </td>
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-black bg-black/40 text-sm font-extrabold text-white">
                  <td className="px-4 py-3" colSpan={2}>
                    Totals (filtered · {rows.length} cheers)
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCents(sums.gmv)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-taxi-300">
                    {formatCents(sums.fee)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCents(sums.net)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <p className="text-xs text-stone-500">
        Refreshes every 15s. `PENDING_PAYMENT` rows are donors sitting at the PayMob checkout
        right now — they don't count toward GMV until the webhook confirms them.
      </p>
    </div>
  );
}
