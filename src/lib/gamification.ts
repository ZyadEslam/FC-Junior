import type { StudentBadgeDto } from "@/types/api";

const BADGE_RULES = [
  { id: "first-share", name: "First Share", description: "Share your first project.", icon: "★", metric: "solved", target: 1 },
  { id: "project-explorer", name: "Project Explorer", description: "Share five completed projects.", icon: "◆", metric: "solved", target: 5 },
  { id: "project-pro", name: "Project Pro", description: "Share ten completed projects.", icon: "✦", metric: "solved", target: 10 },
  { id: "first-step", name: "First Step", description: "Take part in your first challenge.", icon: "●", metric: "participation", target: 1 },
  { id: "regular-builder", name: "Regular Builder", description: "Take part in five challenges.", icon: "▲", metric: "participation", target: 5 },
  { id: "curious-creator", name: "Curious Creator", description: "Take part in ten challenges.", icon: "⬟", metric: "participation", target: 10 },
] as const;

export function getStudentBadges(participationCount: number, solvedCount: number): StudentBadgeDto[] {
  return BADGE_RULES.map((badge) => {
    const count = badge.metric === "solved" ? solvedCount : participationCount;
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      earned: count >= badge.target,
      progress: Math.min(count, badge.target),
      target: badge.target,
    };
  });
}
