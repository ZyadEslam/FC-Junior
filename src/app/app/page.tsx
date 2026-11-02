import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppIndex() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/app");
  if (user.role === "CHILD") {
    const { db } = await import("@/lib/db");
    const child = await db.child.findUnique({ where: { accountId: user.id }, select: { id: true } });
    redirect(child ? `/app/kid/${child.id}` : "/studio-sign-in");
  }
  redirect(user.role === "PARENT" ? "/app/overview" : "/app/circle");
}
