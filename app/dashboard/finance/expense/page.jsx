import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import ExpenseClient from "./ExpenseClient";

export default async function ExpensePage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect("/");
  return <ExpenseClient user={session.user} />;
}
