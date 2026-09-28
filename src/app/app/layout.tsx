// Server layout for everything under /app — session guard happens once here.
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app/app-shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/app");

  const pendingCount =
    user.role === "PARENT"
      ? await db.submission.count({
          where: { status: "PENDING", child: { parentId: user.id } },
        })
      : 0;

  return (
    <AppShell user={{ name: user.name, email: user.email, role: user.role }} pendingCount={pendingCount}>
      {children}
    </AppShell>
  );
}
