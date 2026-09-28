import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppIndex() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/app");
  redirect(user.role === "PARENT" ? "/app/overview" : "/app/circle");
}
