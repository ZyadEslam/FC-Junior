import { db } from "@/lib/db";
import { ok, requireUser } from "@/lib/api";

export async function GET() {
  const auth = await requireUser(["PARENT", "ADMIN"]);
  if (auth.error) return auth.error;

  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true, description: true },
  });

  return ok({ categories });
}
