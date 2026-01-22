// app/admin/pedidos/page.tsx
import { prisma } from "@/lib/prisma";
import AdminTopBar from "@/components/AdminTopBar";
import AdminAutoRefresh from "@/components/AdminAutoRefresh";

export const dynamic = "force-dynamic"; // para que no se quede cacheado

function CLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default async function AdminPedidosPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      status: true,
      shippingMethod: true,
      paymentMethod: true,
      subtotal: true,
      total: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      notes: true,
    },
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm">
        {/* Barra superior (título + cerrar sesión) */}
        <AdminTopBar />

        {/* Auto refresh cada 10 segundos */}
        <AdminAutoRefresh intervalMs={10_000} />

        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Pedidos</h2>
          <span className="text-[11px] text-neutral-500">
            Se actualiza automáticamente cada 10 segundos.
          </span>
        </div>

        <p className="mb-4 text-neutral-300">
          Vista interna con los pedidos guardados en Supabase. Esta sección está
          protegida por login y más adelante podremos agregar cambios de estado
          y notificaciones al cliente.
        </p>

        {orders.length === 0 ? (
          <p className="text-neutral-400">Aún no hay pedidos.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/60">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-neutral-900">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Fecha</th>
                  <th className="px-3 py-2 text-left font-semibold">ID</th>
                  <th className="px-3 py-2 text-left font-semibold">Cliente</th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Contacto
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">Pago</th>
                  <th className="px-3 py-2 text-left font-semibold">Envío</th>
                  <th className="px-3 py-2 text-right font-semibold">Total</th>
                  <th className="px-3 py-2 text-left font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-neutral-800">
                    <td className="px-3 py-2 align-top">
                      {new Date(o.createdAt).toLocaleString("es-CL")}
                    </td>
                    <td className="px-3 py-2 align-top font-mono text-[11px] text-neutral-400">
                      {o.id}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="font-semibold">
                        {o.contactName || "—"}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {o.notes || ""}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-[12px]">
                      <div>{o.contactEmail || "—"}</div>
                      <div className="text-neutral-400">
                        {o.contactPhone || ""}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-[12px]">
                      {o.paymentMethod}
                    </td>
                    <td className="px-3 py-2 align-top text-[12px]">
                      {o.shippingMethod}
                    </td>
                    <td className="px-3 py-2 align-top text-right font-semibold">
                      {CLP(o.total)}
                    </td>
                    <td className="px-3 py-2 align-top text-[12px]">
                      {o.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
