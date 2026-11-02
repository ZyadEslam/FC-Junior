import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ChildDetailClient } from "./child-detail-client";

export const dynamic = "force-dynamic";

export default async function ChildDetailPage({ params }: { params: { childId: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/app");
  if (user.role !== "PARENT") redirect("/app/circle");
  return <ChildDetailClient childId={params.childId} />;
}
