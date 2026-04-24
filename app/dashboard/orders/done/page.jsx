// app/dashboard/orders/done/page.jsx
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import DoneClient from "./DoneClient";

export default async function DonePage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect("/");

  return <DoneClient user={session.user} />;
}
