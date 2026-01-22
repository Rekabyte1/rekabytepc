"use client";

import { useRouter } from "next/navigation";

export default function AdminTopBar() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-white">Panel administrador</h1>
      <button
        onClick={handleLogout}
        className="rounded-lg border border-neutral-700 px-3 py-1 text-sm text-neutral-200 hover:border-red-400 hover:text-red-300"
      >
        Cerrar sesión
      </button>
    </div>
  );
}