import axios, { AxiosError } from "axios";

/** Shared axios instance for browser-side calls to our route handlers. */
export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

type ErrorBody = { error?: { message?: string } };

export function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError<ErrorBody>;
    return e.response?.data?.error?.message ?? e.message ?? "Something went wrong.";
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}
