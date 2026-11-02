"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ChildSignInInput, SignInInput, SignUpInput } from "@/lib/validation";

export function useSignIn() {
  return useMutation({
    mutationFn: async (input: SignInInput) => {
      const { data } = await api.post<{ role: "PARENT" | "DONOR" | "ADMIN" }>("/auth/sign-in", input);
      return data;
    },
  });
}

export function useChildSignIn() {
  return useMutation({
    mutationFn: async (input: ChildSignInInput) =>
      (await api.post<{ role: "CHILD"; childId: string }>("/auth/child-sign-in", input)).data,
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: async (input: SignUpInput) => {
      const { data } = await api.post<{ role: "PARENT" | "DONOR" }>("/auth/sign-up", input);
      return data;
    },
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/sign-out");
    },
  });
}
