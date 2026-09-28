import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ApprovalsClient } from "./approvals-client";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/app");
  if (user.role !== "PARENT") redirect("/app/circle");
  return <ApprovalsClient />;
}
