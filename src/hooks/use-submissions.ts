"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { KidHomeDto, KidTaskDto, PendingReviewDto } from "@/types/api";
import type { ReviewInput, SubmissionCreateInput } from "@/lib/validation";

export function useKidHome(childId: string) {
  return useQuery({
    queryKey: ["kid", childId],
    queryFn: async () => (await api.get<KidHomeDto>(`/kid/${childId}`)).data,
  });
}

export function useKidTask(childId: string, taskId: string) {
  return useQuery({
    queryKey: ["kid", childId, "task", taskId],
    queryFn: async () => (await api.get<KidTaskDto>(`/kid/${childId}/tasks/${taskId}`)).data,
  });
}

export function useCreateSubmission(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SubmissionCreateInput) =>
      (await api.post("/submissions", input)).data,
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["kid", childId] });
      qc.invalidateQueries({ queryKey: ["kid", childId, "task", vars.taskId] });
    },
  });
}

export function usePendingReviews() {
  return useQuery({
    queryKey: ["reviews", "pending"],
    queryFn: async () => (await api.get<PendingReviewDto[]>("/submissions/pending")).data,
  });
}

export function useReviewSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: ReviewInput & { id: string }) =>
      (await api.post(`/submissions/${id}/review`, input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["children"] });
    },
  });
}
