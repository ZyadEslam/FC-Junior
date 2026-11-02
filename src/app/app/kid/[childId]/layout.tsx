import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { KidShell } from "./kid-shell";

export const dynamic = "force-dynamic";

export default async function KidLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { childId: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/app");
  if (user.role !== "CHILD") redirect(user.role === "PARENT" ? `/app/children/${params.childId}` : "/app/circle");

  const child = await db.child.findFirst({
    where: { id: params.childId, accountId: user.id },
  });
  if (!child) notFound();

  return (
    <KidShell
      child={{
        id: child.id,
        firstName: child.firstName,
        avatarColor: child.avatarColor,
      }}
    >
      {children}
    </KidShell>
  );
}
