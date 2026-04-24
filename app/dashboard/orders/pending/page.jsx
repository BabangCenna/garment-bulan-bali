// app/dashboard/orders/pending/page.jsx
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import PendingClient from "./PendingClient";

export default async function PendingPage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect("/");

  return <PendingClient user={session.user} />;
}
