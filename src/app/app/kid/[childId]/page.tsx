import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { KidHomeClient } from "./kid-home-client";

export const dynamic = "force-dynamic";

export default async function KidHomePage({ params }: { params: { childId: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/app");
  return <KidHomeClient childId={params.childId} />;
}
