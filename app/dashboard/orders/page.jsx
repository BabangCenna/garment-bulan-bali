// app/dashboard/orders/page.jsx
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import OrdersClient from "./OrdersClient";
import { getOrders } from "@/app/actions/orders";

export default async function OrdersPage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect("/");
  const orders = await getOrders();
  return <OrdersClient user={session.user} initialOrders={orders} />;
}
