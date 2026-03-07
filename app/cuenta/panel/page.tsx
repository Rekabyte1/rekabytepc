import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import CuentaPanelClient from "./panel.client";

export default async function CuentaPanelPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/cuenta");
  }

  const tab = searchParams?.tab || "compras";

  return <CuentaPanelClient initialTab={tab} />;
}