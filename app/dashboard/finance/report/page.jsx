import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import { getReport } from "@/app/actions/report";
import ReportClient from "./ReportClient";

export default async function ReportPage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect("/");
  const { income, expense } = await getReport();
  return <ReportClient user={session.user} income={income} expense={expense} />;
}
