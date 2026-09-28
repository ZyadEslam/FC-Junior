"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { InvitePreviewDto } from "@/types/api";
import type { InviteAcceptInput } from "@/lib/validation";

export function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (childId: string) =>
      (await api.post<{ code: string }>("/invites", { childId })).data,
    onSuccess: (_d, childId) => {
      qc.invalidateQueries({ queryKey: ["children", childId] });
    },
  });
}

export function useInvitePreview(code: string, enabled = true) {
  return useQuery({
    queryKey: ["invites", code],
    queryFn: async () => (await api.get<InvitePreviewDto>(`/invites/${code}`)).data,
    enabled: enabled && code.length >= 4,
    retry: false,
  });
}

export function useAcceptInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, ...input }: InviteAcceptInput & { code: string }) =>
      (await api.post(`/invites/${code}/accept`, input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["circle"] });
    },
  });
}
