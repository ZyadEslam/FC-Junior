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

export function ageBandForAge(age: number): AgeBand {
  if (age <= 10) return "AGE_8_10";
  if (age <= 13) return "AGE_11_13";
  return "AGE_14_17";
}

export const difficultyMeta: Record<
  Difficulty,
  { label: string; chip: string }
> = {
  BEGINNER: { label: "Starter", chip: "bg-taxi-50 text-taxi-700 ring-taxi-200" },
  INTERMEDIATE: { label: "Builder", chip: "bg-sky-50 text-sky-700 ring-sky-200" },
  ADVANCED: { label: "Pro", chip: "bg-violet-50 text-violet-700 ring-violet-200" },
};

export const statusMeta: Record<
  SubmissionStatus,
  { label: string; chip: string }
> = {
  PENDING: { label: "Waiting", chip: "bg-sun-50 text-amber-700 ring-sun-200" },
  APPROVED: { label: "On the wall", chip: "bg-taxi-50 text-taxi-700 ring-taxi-200" },
  CHANGES_REQUESTED: { label: "Needs tweaks", chip: "bg-flame-50 text-flame-600 ring-flame-200" },
};

export const avatarColorMeta: Record<
  string,
  { bg: string; text: string; softBg: string; dot: string }
> = {
  emerald: { bg: "bg-taxi-400", text: "text-ink", softBg: "bg-taxi-50", dot: "bg-taxi-400" },
  sky: { bg: "bg-sky-500", text: "text-white", softBg: "bg-sky-50", dot: "bg-sky-500" },
  violet: { bg: "bg-violet-500", text: "text-white", softBg: "bg-violet-50", dot: "bg-violet-500" },
  rose: { bg: "bg-flame-500", text: "text-white", softBg: "bg-flame-50", dot: "bg-flame-500" },
  amber: { bg: "bg-sun-400", text: "text-white", softBg: "bg-sun-50", dot: "bg-sun-400" },
  indigo: { bg: "bg-indigo-500", text: "text-white", softBg: "bg-indigo-50", dot: "bg-indigo-500" },
};
