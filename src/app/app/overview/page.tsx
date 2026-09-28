import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { OverviewClient } from "./overview-client";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/app");
  if (user.role !== "PARENT") redirect("/app/circle");
  return <OverviewClient parentName={user.name} />;
}
