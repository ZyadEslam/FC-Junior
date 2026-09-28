import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Eye, LogOut, Star } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Logo } from "@/components/ui/logo";
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
  if (user.role !== "PARENT") redirect("/app/circle");

  const child = await db.child.findFirst({
    where: { id: params.childId, parentId: user.id },
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
