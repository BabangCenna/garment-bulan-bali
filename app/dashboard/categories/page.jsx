// app/dashboard/categories/page.jsx
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import CategoriesClient from "./CategoriesClient";
import { getSizes, getStyles, getFabrics } from "@/app/actions/attributes";

export default async function CategoriesPage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect("/");

  let sizes = [],
    styles = [],
    fabrics = [];

  try {
    [sizes, styles, fabrics] = await Promise.all([
      getSizes(),
      getStyles(),
      getFabrics(),
    ]);
  } catch (err) {
    console.error("Failed to fetch attributes:", err);
  }

  const normalizedSizes = (sizes ?? []).map((s) => ({
    ...s,
    id: Number(s.id),
    sortOrder: Number(s.sort_order),
    status: s.status === 1,
    productCount: 0,
  }));

  const normalizedStyles = (styles ?? []).map((s) => ({
    ...s,
    id: Number(s.id),
    productCount: 0,
  }));

  const normalizedFabrics = (fabrics ?? []).map((f) => ({
    ...f,
    id: Number(f.id),
    status: f.status === 1,
    productCount: 0,
  }));

  return (
    <CategoriesClient
      user={session.user}
      initialSizes={normalizedSizes}
      initialStyles={normalizedStyles}
      initialFabrics={normalizedFabrics}
    />
  );
}
