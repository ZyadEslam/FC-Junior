import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { fail, ok, parseBody, requireUser } from "@/lib/api";
import { categoryCreateSchema } from "@/lib/validation";

function slugFor(name: string) {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `category-${randomUUID()}`;
}

export async function GET() {
  const auth = await requireUser("ADMIN");
  if (auth.error) return auth.error;

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { children: true, tasks: true } } },
  });
  return ok({ categories });
}

export async function POST(req: Request) {
  const auth = await requireUser("ADMIN");
  if (auth.error) return auth.error;

  const parsed = await parseBody(req, categoryCreateSchema);
  if (parsed.error) return parsed.error;

  const slug = slugFor(parsed.data.name);
  const existing = await db.category.findUnique({ where: { slug }, select: { id: true } });
  if (existing) return fail("A category with this name already exists.", 409);

  const category = await db.category.create({ data: { ...parsed.data, slug } });
  return ok({ category }, { status: 201 });
}
