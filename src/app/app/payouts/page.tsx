import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { PayoutsClient } from "./payouts-client";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/app");
  if (user.role !== "PARENT") redirect("/app/circle");
  return <PayoutsClient />;
}
