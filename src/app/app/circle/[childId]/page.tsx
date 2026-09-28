import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ChildFeedClient } from "./child-feed-client";

export const dynamic = "force-dynamic";

export default async function ChildFeedPage({ params }: { params: { childId: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/app");
  return <ChildFeedClient childId={params.childId} viewerRole={user.role} viewerName={user.name} />;
}
