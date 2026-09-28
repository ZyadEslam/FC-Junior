"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ChildDetailDto, DashboardDto } from "@/types/api";
import type { ChildCreateInput, ChildUpdateInput } from "@/lib/validation";

export function useDashboard(enabled = true) {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get<DashboardDto>("/dashboard")).data,
    enabled,
  });
}

export function useChild(childId: string) {
  return useQuery({
    queryKey: ["children", childId],
    queryFn: async () => (await api.get<ChildDetailDto>(`/children/${childId}`)).data,
  });
}

export function useCreateChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ChildCreateInput) =>
      (await api.post<{ id: string }>("/children", input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateChild(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ChildUpdateInput) =>
      (await api.patch(`/children/${childId}`, input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["children", childId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
