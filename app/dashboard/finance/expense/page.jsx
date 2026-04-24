import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import { getExpenses } from "@/app/actions/expense";
import ExpenseClient from "./ExpenseClient";

export default async function ExpensePage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect("/");
  const expenses = await getExpenses();
  return <ExpenseClient user={session.user} initialExpenses={expenses} />;
}
