// app/dashboard/suppliers/page.jsx
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import SuppliersClient from "./SuppliersClient";

export default async function SuppliersPage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect("/");

  return <SuppliersClient user={session.user} />;
}
