import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import { getIncome } from "@/app/actions/income";
import IncomeClient from "./IncomeClient";

export default async function IncomePage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect("/");
  const income = await getIncome();
  return <IncomeClient user={session.user} initialIncome={income} />;
}
