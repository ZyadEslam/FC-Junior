import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TaskDetailClient } from "./task-detail-client";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({
  params,
}: {
  params: { childId: string; taskId: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/app");
  return <TaskDetailClient childId={params.childId} taskId={params.taskId} />;
}
