import type { AgeBand, Difficulty, SubmissionStatus } from "@prisma/client";

/** DTOs returned by our API routes (client-side shapes). */

export interface TaskDto {
  id: string;
  slug: string;
  ageBand: AgeBand;
  title: string;
  summary: string;
  instructions: string;
  deliverable: string;
  rubric: string[];
  difficulty: Difficulty;
  points: number;
  estimatedMinutes: number;
}

export interface KidTaskDto extends TaskDto {
  mySubmission: {
    id: string;
    status: SubmissionStatus;
    note: string;
    feedback: string | null;
    proofLink: string | null;
    proofImage: string | null;
    updatedAt: string;
  } | null;
}

export interface ChildSummaryDto {
  id: string;
  firstName: string;
  ageBand: AgeBand;
  avatarColor: string;
  weeklyGoalCents: number;
  points: number;
  weekReceivedCents: number;
  totalReceivedCents: number;
  pendingCount: number;
}

export interface ActivityItem {
  id: string;
  type: "submission" | "review" | "donation" | "member";
  text: string;
  childName: string;
  createdAt: string;
}

export interface DashboardDto {
  stats: {
    activeChildren: number;
    pendingCount: number;
    weekReceivedCents: number;
    totalPaidOutCents: number;
  };
  children: ChildSummaryDto[];
  activity: ActivityItem[];
}

export interface PendingReviewDto {
  id: string;
  note: string;
  proofLink: string | null;
  proofImage: string | null;
  status: SubmissionStatus;
  createdAt: string;
  child: { id: string; firstName: string; avatarColor: string; ageBand: AgeBand };
  task: {
    id: string;
    title: string;
    difficulty: Difficulty;
    points: number;
    rubric: string[];
    deliverable: string;
  };
}

export interface ChildDetailDto {
  child: {
    id: string;
    firstName: string;
    ageBand: AgeBand;
    avatarColor: string;
    weeklyGoalCents: number;
    points: number;
    totalReceivedCents: number;
    weekReceivedCents: number;
  };
  members: {
    id: string;
    relationLabel: string;
    createdAt: string;
    donor: { id: string; name: string };
  }[];
  invites: { id: string; code: string; expiresAt: string; uses: number }[];
  submissions: PendingReviewDto[];
  donations: {
    id: string;
    amountCents: number;
    message: string | null;
    status: "PENDING_PAYOUT" | "PAID_OUT";
    weekKey: string;
    createdAt: string;
    donor: { name: string };
  }[];
}

export interface KidHomeDto {
  child: {
    id: string;
    firstName: string;
    ageBand: AgeBand;
    avatarColor: string;
    weeklyGoalCents: number;
    points: number;
    earnedCents: number;
    weekReceivedCents: number;
    approvedCount: number;
    supporterCount: number;
  };
  tasks: KidTaskDto[];
}

export interface CircleChildDto {
  child: {
    id: string;
    firstName: string;
    ageBand: AgeBand;
    avatarColor: string;
  };
  relationLabel: string;
  joinedAt: string;
  myTotalCents: number;
  circleTotalCents: number;
  approvedCount: number;
  latestPostAt: string | null;
}

export interface FeedPostDto {
  id: string;
  note: string;
  proofLink: string | null;
  proofImage: string | null;
  createdAt: string;
  task: { title: string; difficulty: Difficulty; points: number };
}

export interface ChildFeedDto {
  child: {
    id: string;
    firstName: string;
    ageBand: AgeBand;
    avatarColor: string;
    totalReceivedCents: number;
    memberCount: number;
  };
  relationLabel: string | null; // viewer's relation label, when donor
  myTotalCents: number;
  posts: FeedPostDto[];
}

export interface InvitePreviewDto {
  code: string;
  childFirstName: string;
  childAgeBand: AgeBand;
  inviterName: string;
  expiresAt: string;
}

export interface PayoutDto {
  id: string;
  amountCents: number;
  donationCount: number;
  weekKeys: string;
  status: string;
  createdAt: string;
  child: { id: string; firstName: string; avatarColor: string };
}

export interface PayoutsDto {
  pendingByChild: {
    childId: string;
    firstName: string;
    avatarColor: string;
    pendingCents: number;
    pendingCount: number;
  }[];
  payouts: PayoutDto[];
}
