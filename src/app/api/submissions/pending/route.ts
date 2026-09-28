import { db } from "@/lib/db";
import { ok, requireUser } from "@/lib/api";

/** Parent's moderation queue: all submissions awaiting review. */
export async function GET() {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;

  const pending = await db.submission.findMany({
    where: { status: "PENDING", child: { parentId: auth.user.id } },
    orderBy: { createdAt: "asc" },
    include: {
      child: { select: { id: true, firstName: true, avatarColor: true, ageBand: true } },
      task: { select: { id: true, title: true, difficulty: true, points: true, rubric: true, deliverable: true } },
    },
  });

  return ok(pending);
}
