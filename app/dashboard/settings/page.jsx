// app/dashboard/settings/page.js
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import {
  getSiteConfig,
  getAvailableStyles,
  getAvailableFabrics,
} from "@/app/actions/settings";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect("/");
  const [config, availableStyles, availableFabrics] = await Promise.all([
    getSiteConfig(),
    getAvailableStyles(),
    getAvailableFabrics(),
  ]);
  return (
    <SettingsClient
      user={session.user}
      initialConfig={config}
      availableStyles={availableStyles}
      availableFabrics={availableFabrics}
    />
  );
}
