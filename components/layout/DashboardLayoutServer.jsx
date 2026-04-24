// components/layout/DashboardLayoutServer.jsx
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import DashboardLayout from "./DashboardLayout";

export default async function DashboardLayoutServer({ children, activeKey }) {
  const session = await getIronSession(await cookies(), sessionOptions);
  return (
    <DashboardLayout activeKey={activeKey} user={session.user}>
      {children}
    </DashboardLayout>
  );
}
