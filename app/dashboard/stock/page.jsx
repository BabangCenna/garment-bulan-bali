// app/dashboard/stock/page.jsx
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import StockClient from "./StockClient";

export default async function StockPage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect("/");

  return <StockClient user={session.user} />;
}
