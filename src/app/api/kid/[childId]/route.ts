import { db } from "@/lib/db";
import { fail, ok, requireUser } from "@/lib/api";
import { ageBandOrder } from "@/lib/labels";
import { weekKeyOf } from "@/lib/utils";
import type { AgeBand } from "@prisma/client";

type Ctx = { params: { childId: string } };

/** Kid workspace home — guarded: only the custodial parent's session. */
export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;

  const child = await db.child.findFirst({
    where: { id: params.childId, parentId: auth.user.id },
    include: {
      submissions: { select: { taskId: true, status: true, note: true, feedback: true, proofLink: true, proofImage: true, updatedAt: true, task: { select: { points: true } } } },
      donations: { select: { amountCents: true, weekKey: true } },
      members: { select: { id: true } },
    },
  });
  if (!child) return fail("Child not found.", 404);

  const allowedBands = (Object.keys(ageBandOrder) as AgeBand[]).filter(
    (b) => ageBandOrder[b] <= ageBandOrder[child.ageBand]
  );

  const tasks = await db.task.findMany({
    where: { isPublished: true, ageBand: { in: allowedBands } },
    orderBy: { order: "asc" },
  });

  const byTaskId = new Map(child.submissions.map((s) => [s.taskId, s]));
  const currentWeek = weekKeyOf(new Date());

  return ok({
    child: {
      id: child.id,
      firstName: child.firstName,
      ageBand: child.ageBand,
      avatarColor: child.avatarColor,
      weeklyGoalCents: child.weeklyGoalCents,
      points: child.submissions.reduce((s, x) => s + (x.status === "APPROVED" ? x.task.points : 0), 0),
      earnedCents: child.donations.reduce((s, d) => s + d.amountCents, 0),
      weekReceivedCents: child.donations.reduce((s, d) => s + (d.weekKey === currentWeek ? d.amountCents : 0), 0),
      approvedCount: child.submissions.filter((s) => s.status === "APPROVED").length,
      supporterCount: child.members.length,
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
        rubric: t.rubric as string[],
        difficulty: t.difficulty,
        points: t.points,
        estimatedMinutes: t.estimatedMinutes,
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
