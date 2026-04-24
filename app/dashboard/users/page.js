// app/dashboard/users/page.js
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import { getUsers, getRoles } from "@/app/actions/users";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect("/");
  const [users, roles] = await Promise.all([getUsers(), getRoles()]);
  return <UsersClient user={session.user} initialUsers={users} roles={roles} />;
}
