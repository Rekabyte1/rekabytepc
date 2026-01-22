// app/admin/page.tsx
import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  // Redirige al listado principal de pedidos
  redirect("/admin/pedidos");
}
