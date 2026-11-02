"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiErrorMessage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Dest = { payoutMethod: "WALLET" | "BANK" | null; payoutDest: string | null };

export function PayoutDestinationCard() {
  const { push } = useToast();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["me", "payout"],
    queryFn: async () => (await api.get<Dest>("/me/payout")).data,
  });

  const [editing, setEditing] = useState(false);
  const [method, setMethod] = useState<"WALLET" | "BANK">("WALLET");
  const [dest, setDest] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/me/payout", { method, dest });
      push({ variant: "success", title: "Payday destination saved" });
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["me", "payout"] });
    } catch (err) {
      push({ variant: "error", title: "Couldn't save", description: apiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  const hasDest = !!data?.payoutDest;

  return (
    <div className="border-2 border-ink bg-white p-5 shadow-hard-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-flame-600">
            Where your money lands
          </p>
          <h3 className="mt-1 font-display text-lg tracking-tight text-ink">
            {hasDest
              ? data!.payoutMethod === "WALLET"
                ? "Your mobile wallet"
                : "Your bank account"
              : "Set up your payday destination"}
          </h3>
          <p className="mt-1 max-w-lg text-sm font-medium leading-[1.65] text-stone-600">
            {hasDest ? (
              <>
                Friday batches go to <span className="font-extrabold text-ink">{data!.payoutDest}</span>.
                Switch anytime.
              </>
            ) : (
              <>
                Cheers are collected by PayMob into FC-Junior&apos;s merchant account through the week.
                Every Friday the kids&apos; jars are batched and sent on to you — by{" "}
                <span className="font-extrabold text-ink">mobile wallet</span> (Vodafone Cash,
                Orange, e& Cash, WE) or <span className="font-extrabold text-ink">bank IBAN</span>.
                Kids never hold account details — it all stays with the grown-ups.
              </>
            )}
          </p>
        </div>
        <span className="border-2 border-ink bg-taxi-400 px-2.5 py-1 text-xs font-extrabold uppercase shadow-hard-xs">
          Parent only
        </span>
      </div>

      {editing ? (
        <form onSubmit={save} className="mt-4 space-y-3">
          <div className="flex gap-2">
            {(["WALLET", "BANK"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={cn(
                  "h-11 flex-1 rounded-xl border-2 border-ink text-[15px] font-bold transition-all",
                  method === m ? "bg-taxi-400 shadow-hard-xs" : "bg-paper hover:bg-taxi-50"
                )}
              >
                {m === "WALLET" ? "Mobile wallet" : "Bank (IBAN)"}
              </button>
            ))}
          </div>
          <Field
            label={method === "WALLET" ? "Wallet number" : "IBAN"}
            hint={
              method === "WALLET"
                ? "11 digits starting 01 — e.g. 01012345678 (Vodafone/Orange/e&/WE Cash)"
                : "Egyptian IBAN, 29 characters starting with EG (e.g. EG380019000500000000263180002)"
            }
          >
            <Input
              inputMode={method === "WALLET" ? "numeric" : "text"}
              placeholder={method === "WALLET" ? "01xxxxxxxxx" : "EG…"}
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              className={method === "BANK" ? "font-mono" : ""}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>Save destination</Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          className="mt-4"
          variant={hasDest ? "secondary" : "amber"}
          onClick={() => setEditing(true)}
        >
          {hasDest ? "Change destination" : "Set it up"}
        </Button>
      )}
    </div>
  );
}
