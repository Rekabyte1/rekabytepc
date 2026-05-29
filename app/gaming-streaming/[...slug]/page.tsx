import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { slug: string[] };
};

function normalizePath(slug: string[]) {
  return slug.map((s) => decodeURIComponent(s).toLowerCase()).join("/");
}

function resolveLegacyPath(path: string) {
  if (path === "perifericos" || path === "perifericos/") return "/perifericos";
  if (path === "perifericos/teclado") return "/perifericos/teclados";
  if (path === "perifericos/teclados") return "/perifericos/teclados";
  if (path === "perifericos/mouse") return "/perifericos/mouse";
  if (path === "perifericos/mousepad" || path === "perifericos/alfombrilla") return "/perifericos/alfombrillas";
  if (path === "perifericos/audifonos") return "/perifericos/audio";
  if (path.startsWith("streaming")) return "/streaming";
  return "/perifericos";
}

export default function GamingStreamingLegacySlugPage({ params }: PageProps) {
  const path = normalizePath(params.slug ?? []);
  redirect(resolveLegacyPath(path));
}