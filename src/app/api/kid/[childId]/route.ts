import { db } from "@/lib/db";
import { fail, ok, requireChildWorkspace } from "@/lib/api";
import { ageBandOrder } from "@/lib/labels";
import { getStudentBadges } from "@/lib/gamification";
import { weekKeyOf } from "@/lib/utils";
import type { AgeBand } from "@prisma/client";

type Ctx = { params: { childId: string } };

/** Kid workspace home — guarded: only the custodial parent's session. */
export async function GET(_req: Request, { params }: Ctx) {
  const workspace = await requireChildWorkspace(params.childId);
  if ("error" in workspace) return workspace.error;

  const child = await db.child.findFirst({
    where: { id: workspace.child.id },
    include: {
      submissions: { select: { taskId: true, status: true, note: true, feedback: true, proofLink: true, proofImage: true, updatedAt: true, task: { select: { points: true } } } },
      donations: { select: { amountCents: true, feeCents: true, weekKey: true } },
      members: { select: { id: true } },
      categories: { where: { isActive: true }, select: { id: true, slug: true, name: true } },
      categoryProgress: {
        select: { categoryId: true, solvedCount: true, level: true },
      },
    },
  });
  if (!child) return fail("Child not found.", 404);

  const allowedBands = (Object.keys(ageBandOrder) as AgeBand[]).filter(
    (b) => ageBandOrder[b] <= ageBandOrder[child.ageBand]
  );

  const tasks = await db.task.findMany({
    where: {
      isPublished: true,
      ageBand: { in: allowedBands },
      categories: { some: { id: { in: child.categories.map((category) => category.id) } } },
      OR: [{ generatedForChildId: null }, { generatedForChildId: child.id }],
    },
    include: { categories: { select: { id: true, slug: true, name: true } } },
    orderBy: { order: "asc" },
  });

  const byTaskId = new Map(child.submissions.map((s) => [s.taskId, s]));
  const currentWeek = weekKeyOf(new Date());

  return ok({
    child: {
      id: child.id,
      firstName: child.firstName,
      age: child.age,
      ageBand: child.ageBand,
      avatarColor: child.avatarColor,
      weeklyGoalCents: child.weeklyGoalCents,
      points: child.submissions.reduce((s, x) => s + (x.status === "APPROVED" ? x.task.points : 0), 0),
      earnedCents: child.donations.reduce((s, d) => s + (d.amountCents - d.feeCents), 0),
      weekReceivedCents: child.donations.reduce((s, d) => s + (d.weekKey === currentWeek ? d.amountCents - d.feeCents : 0), 0),
      approvedCount: child.submissions.filter((s) => s.status === "APPROVED").length,
      supporterCount: child.members.length,
      participationCount: child.submissions.length,
      solvedCount: child.submissions.filter((s) => s.status === "APPROVED").length,
      categories: child.categories,
      categoryProgress: child.categoryProgress,
      badges: getStudentBadges(
        child.submissions.length,
        child.submissions.filter((s) => s.status === "APPROVED").length
      ),
    },
    tasks: tasks.map((t) => {
      const sub = byTaskId.get(t.id);
      return {
        id: t.id,
        slug: t.slug,
        ageBand: t.ageBand,
        title: t.title,
        summary: t.summary,
        instructions: t.instructions,
        deliverable: t.deliverable,
        starter: t.starter,
        question: t.question,
        rubric: t.rubric as string[],
        difficulty: t.difficulty,
        points: t.points,
        estimatedMinutes: t.estimatedMinutes,
        categories: t.categories,
        testCases: Array.isArray(t.testCases)
          ? t.testCases.filter((testCase): testCase is string => typeof testCase === "string")
          : [],
        mySubmission: sub
          ? {
              id: "",
              status: sub.status,
              note: sub.note,
              feedback: sub.feedback,
              proofLink: sub.proofLink,
              proofImage: sub.proofImage,
              updatedAt: sub.updatedAt,
            }
          : null,
      };
    }),
  });
}
