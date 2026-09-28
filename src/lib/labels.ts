import type { AgeBand, Difficulty, SubmissionStatus } from "@prisma/client";

/** Presentation mappings for domain enums, shared by server + client. */

export const ageBandLabel: Record<AgeBand, string> = {
  AGE_8_10: "Ages 8–10",
  AGE_11_13: "Ages 11–13",
  AGE_14_17: "Ages 14–17",
};

export const ageBandShort: Record<AgeBand, string> = {
  AGE_8_10: "8–10",
  AGE_11_13: "11–13",
  AGE_14_17: "14–17",
};

export const ageBandOrder: Record<AgeBand, number> = {
  AGE_8_10: 0,
  AGE_11_13: 1,
  AGE_14_17: 2,
};

export const difficultyMeta: Record<
  Difficulty,
  { label: string; chip: string }
> = {
  BEGINNER: { label: "Starter", chip: "bg-brand-50 text-brand-700 ring-brand-200" },
  INTERMEDIATE: { label: "Builder", chip: "bg-sky-50 text-sky-700 ring-sky-200" },
  ADVANCED: { label: "Pro", chip: "bg-violet-50 text-violet-700 ring-violet-200" },
};

export const statusMeta: Record<
  SubmissionStatus,
  { label: string; chip: string }
> = {
  PENDING: { label: "In review", chip: "bg-amber-50 text-amber-700 ring-amber-200" },
  APPROVED: { label: "Approved", chip: "bg-brand-50 text-brand-700 ring-brand-200" },
  CHANGES_REQUESTED: { label: "Needs tweaks", chip: "bg-rose-50 text-rose-700 ring-rose-200" },
};

export const avatarColorMeta: Record<
  string,
  { bg: string; text: string; softBg: string; dot: string }
> = {
  emerald: { bg: "bg-brand-600", text: "text-white", softBg: "bg-brand-50", dot: "bg-brand-500" },
  sky: { bg: "bg-sky-600", text: "text-white", softBg: "bg-sky-50", dot: "bg-sky-500" },
  violet: { bg: "bg-violet-600", text: "text-white", softBg: "bg-violet-50", dot: "bg-violet-500" },
  rose: { bg: "bg-rose-600", text: "text-white", softBg: "bg-rose-50", dot: "bg-rose-500" },
  amber: { bg: "bg-amber-500", text: "text-white", softBg: "bg-amber-50", dot: "bg-amber-500" },
  indigo: { bg: "bg-indigo-600", text: "text-white", softBg: "bg-indigo-50", dot: "bg-indigo-500" },
};
