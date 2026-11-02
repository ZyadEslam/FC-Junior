"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiErrorMessage } from "@/lib/api-client";
import { Logo } from "@/components/ui/logo";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type StatusPayload = {
  status: string;
  paid: boolean;
  failed: boolean;
  childId: string;
  childName: string;
  amountCents: number;
  viewerIsParent: boolean;
};

function ReturnInner() {
  const params = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const donationId = params.get("donation");
  const [gaveUp, setGaveUp] = useState(false);

  const { data, error, isLoading } = useQuery({
    queryKey: ["payment-status", donationId],
    queryFn: async () => (await api.get<StatusPayload>(`/payments/${donationId}/status`)).data,
    enabled: !!donationId,
    refetchInterval: (query) => {
      const d = query.state.data;
      return d && (d.paid || d.failed) ? false : 2500;
    },
    retry: false,
  });

  // Stop polling after ~30s even if the webhook is slow.
  useEffect(() => {
    const t = setTimeout(() => setGaveUp(true), 30_000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (data?.paid || data?.failed) {
      qc.invalidateQueries({ queryKey: ["circle"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    }
  }, [data?.paid, data?.failed, qc]);

  const back = data?.viewerIsParent ? "/app/overview" : data ? `/app/circle/${data.childId}` : "/app/circle";

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex h-16 items-center justify-center border-b border-stone-200 bg-white">
        <Logo />
      </header>
      <main className="dot-grid flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <Card className="shadow-pop">
            <CardBody className="p-8 text-center">
              {!donationId ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Payment</p>
                  <h1 className="mt-2 font-display text-2xl font-extrabold text-stone-900">Missing reference</h1>
                  <p className="mt-2 text-sm text-stone-500">This link is incomplete. Check the URL from your receipt.</p>
                </>
              ) : isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="mx-auto h-6 w-40" />
                  <Skeleton className="mx-auto h-4 w-64" />
                </div>
              ) : error || !data ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-flame-600">Problem</p>
                  <h1 className="mt-2 font-display text-2xl font-extrabold text-stone-900">We couldn&apos;t find that payment</h1>
                  <p className="mt-2 text-sm text-stone-500">{apiErrorMessage(error)}</p>
                </>
              ) : data.paid ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-taxi-700">Success</p>
                  <h1 className="mt-2 font-display text-3xl font-extrabold text-stone-900">
                    Your cheer is in the jar.
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed text-stone-500">
                    ${(data.amountCents / 100).toFixed(2)} is confirmed and waiting with
                    everything else for <span className="font-bold text-stone-900">{data.childName}&apos;s Friday payday</span>.
                    Nice one.
                  </p>
                </>
              ) : data.failed ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-flame-600">Didn&apos;t go through</p>
                  <h1 className="mt-2 font-display text-2xl font-extrabold text-stone-900">The payment was declined.</h1>
                  <p className="mt-2 text-sm text-stone-500">No charge was made. You can try again with a different method.</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Processing</p>
                  <h1 className="mt-2 font-display text-2xl font-extrabold text-stone-900">
                    {gaveUp ? "Still confirming…" : "Confirming your payment…"}
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500">
                    {gaveUp
                      ? "Your bank confirmed the payment but we're still syncing — it will appear shortly on the wall."
                      : "Sit tight for a few seconds while PayMob confirms it."}
                  </p>
                </>
              )}

              <Button className="mt-6 w-full" onClick={() => router.push(back)}>
                {data?.paid ? "Back to the wall" : "Continue"}
              </Button>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense>
      <ReturnInner />
    </Suspense>
  );
}
