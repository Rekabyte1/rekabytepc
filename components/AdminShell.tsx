"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", description: "Resumen operativo" },
  { href: "/admin/operaciones", label: "Operaciones", description: "Alertas y prioridades" },
  { href: "/admin/pedidos", label: "Pedidos", description: "Gestión diaria" },
  { href: "/admin/reportes", label: "Reportes", description: "Lectura comercial" },
  { href: "/admin/productos", label: "Productos", description: "Catálogo operativo" },
  { href: "/admin/clientes", label: "Clientes", description: "Próximamente" },
  { href: "/admin/configuracion", label: "Configuración", description: "Próximamente" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_360px_at_0%_0%,rgba(163,230,53,0.12),transparent_55%),radial-gradient(700px_320px_at_100%_10%,rgba(34,197,94,0.08),transparent_55%)]" />

      <div className="relative mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-neutral-800 bg-black/30 p-4 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-5">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/70 p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-lime-300">
              RekaByte
            </p>
            <h2 className="mt-2 text-xl font-black text-white">Admin Operativo</h2>
            <p className="mt-2 text-xs leading-5 text-neutral-400">
              Backoffice para revisar pedidos, prioridades, catálogo y operación comercial.
            </p>
          </div>

          <nav className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-2xl border px-4 py-3 transition",
                    active
                      ? "border-lime-400/40 bg-lime-400/10 text-lime-200"
                      : "border-neutral-800 bg-neutral-950/45 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900/70",
                  ].join(" ")}
                >
                  <div className="text-sm font-extrabold">{item.label}</div>
                  <div className="mt-1 hidden text-[11px] text-neutral-500 sm:block">
                    {item.description}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-2xl border border-neutral-800 bg-black/25 p-4 text-xs text-neutral-500">
            <span className="font-extrabold text-neutral-300">Modo seguro:</span>{" "}
            esta etapa usa vistas y consultas read-only para operación diaria.
          </div>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}