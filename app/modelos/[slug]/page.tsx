import { redirect } from "next/navigation";

export default function Page({ params }: { params: { slug: string } }) {
  redirect(`/producto/${decodeURIComponent(params.slug)}`);
}