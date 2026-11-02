"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ChildFeedDto, CircleChildDto, PayoutsDto } from "@/types/api";
import type { DonationCreateInput } from "@/lib/validation";

export function useCircle(enabled = true) {
  return useQuery({
    queryKey: ["circle"],
    queryFn: async () => (await api.get<CircleChildDto[]>("/circle")).data,
    enabled,
  });
}

export function useChildFeed(childId: string) {
  return useQuery({
    queryKey: ["circle", childId],
    queryFn: async () => (await api.get<ChildFeedDto>(`/circle/${childId}`)).data,
  });
}

export function useDonate(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DonationCreateInput) =>
      (
        await api.post<{ mode: "demo" | "live"; checkoutUrl?: string; id: string }>(
          "/payments/intention",
          input
        )
      ).data,
    onSuccess: (data) => {
      if (data.mode === "demo") {
        qc.invalidateQueries({ queryKey: ["circle"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        qc.invalidateQueries({ queryKey: ["kid", childId] });
      }
      // live mode redirects to PayMob checkout — invalidation happens on return
    },
  });
}

export function usePayouts() {
  return useQuery({
    queryKey: ["payouts"],
    queryFn: async () => (await api.get<PayoutsDto>("/payouts")).data,
  });
}

export function useRunPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post("/payouts/run")).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payouts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["children"] });
      qc.invalidateQueries({ queryKey: ["circle"] });
    },
  });
}
