// app/dashboard/customers/page.jsx
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import { getCustomers } from "@/app/actions/customers";
import CustomersClient from "./CustomersClient";

export default async function CustomersPage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect("/");
  const customers = await getCustomers();
  return <CustomersClient user={session.user} initialCustomers={customers} />;
}
