import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { CircleClient } from "./circle-client";

export const dynamic = "force-dynamic";

export default async function CirclePage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/app");
  if (user.role !== "DONOR") redirect("/app/overview");
  return <CircleClient supporterName={user.name} />;
}
