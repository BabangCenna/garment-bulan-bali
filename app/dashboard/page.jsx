// app/dashboard/page.jsx
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/app/actions/dashboard";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect("/");

  const data = await getDashboardData();
  return <DashboardClient user={session.user} data={data} />;
}
