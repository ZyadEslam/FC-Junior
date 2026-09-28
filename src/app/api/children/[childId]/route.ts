import { db } from "@/lib/db";
import { fail, ok, parseBody, requireUser } from "@/lib/api";
import { childUpdateSchema } from "@/lib/validation";
import { weekKeyOf } from "@/lib/utils";

type Ctx = { params: { childId: string } };

async function ownedChild(childId: string, parentId: string) {
  return db.child.findFirst({ where: { id: childId, parentId } });
}

export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;

  const child = await db.child.findFirst({
    where: { id: params.childId, parentId: auth.user.id },
    include: {
      members: {
        orderBy: { createdAt: "asc" },
        include: { donor: { select: { id: true, name: true } } },
      },
      invites: { orderBy: { createdAt: "desc" }, take: 5 },
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          child: { select: { id: true, firstName: true, avatarColor: true, ageBand: true } },
          task: { select: { id: true, title: true, difficulty: true, points: true, rubric: true, deliverable: true } },
        },
      },
      donations: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { donor: { select: { name: true } } },
      },
    },
  });
  if (!child) return fail("Child not found.", 404);

  const currentWeek = weekKeyOf(new Date());
  const approvedPoints = await db.submission.findMany({
    where: { childId: child.id, status: "APPROVED" },
    select: { task: { select: { points: true } } },
  });

  return ok({
    child: {
      id: child.id,
      firstName: child.firstName,
      ageBand: child.ageBand,
      avatarColor: child.avatarColor,
      weeklyGoalCents: child.weeklyGoalCents,
      points: approvedPoints.reduce((s, x) => s + x.task.points, 0),
      totalReceivedCents: child.donations.reduce((s, d) => s + d.amountCents, 0),
      weekReceivedCents: child.donations.reduce(
        (s, d) => s + (d.weekKey === currentWeek ? d.amountCents : 0),
        0
      ),
    },
    members: child.members.map((m) => ({
      id: m.id,
      relationLabel: m.relationLabel,
      createdAt: m.createdAt,
      donor: m.donor,
    })),
    invites: child.invites.map((i) => ({
      id: i.id,
      code: i.code,
      expiresAt: i.expiresAt,
      uses: i.uses,
    })),
    submissions: child.submissions,
    donations: child.donations,
  });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;

  if (!(await ownedChild(params.childId, auth.user.id))) {
    return fail("Child not found.", 404);
  }

  const parsed = await parseBody(req, childUpdateSchema);
  if (parsed.error) return parsed.error;

  await db.child.update({
    where: { id: params.childId },
    data: { weeklyGoalCents: parsed.data.weeklyGoalCents },
  });
  return ok({ updated: true });
}
