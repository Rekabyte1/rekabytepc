// app/admin/pedidos/[id]/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminOrderStatusForm from "@/components/AdminOrderStatusForm";


export const dynamic = "force-dynamic";

function CLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

const PAYMENT_LABELS: Record<string, string> = {
  TRANSFER: "Transferencia",
  CARD: "Tarjeta / Webpay / Mercado Pago",
};

const SHIPPING_LABELS: Record<string, string> = {
  PICKUP: "Retiro en tienda",
  DELIVERY: "Envío a domicilio",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pendiente de pago",
  PAID: "Pagado / pago confirmado",
  PREPARING: "Preparando pedido",
  SHIPPED: "Despachado",
  COMPLETED: "Completado / entregado",
  CANCELLED: "Cancelado",
};

type PageProps = {
  params: { id: string };
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const orderId = params.id;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-100">
        <h1 className="mb-4 text-2xl font-bold text-white">Pedido no encontrado</h1>
        <Link href="/admin/pedidos" className="text-lime-400">
          ← Volver a pedidos
        </Link>
      </main>
    );
  }

  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod;
  const shippingLabel = SHIPPING_LABELS[order.shippingMethod] ?? order.shippingMethod;
  const statusLabel = STATUS_LABELS[order.status] ?? order.status;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-100">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <Link href="/admin/pedidos" className="text-xs text-lime-400">
            ← Volver a pedidos
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Pedido <span className="font-mono text-base text-neutral-400">{order.id}</span>
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Creado el{" "}
            {new Date(order.createdAt).toLocaleString("es-CL", {
              dateStyle: "short",
              timeStyle: "short",
            })}
            . Estado actual: <span className="font-semibold">{statusLabel}</span>
          </p>
        </div>
      </div>

      {/* Detalle básico */}
      <section className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        <h2 className="mb-3 text-base font-semibold text-white">Detalle del pedido</h2>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-neutral-500">
              Cliente
            </div>
            <div className="text-sm font-semibold">
              {order.contactName || "—"}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-neutral-500">
              Correo
            </div>
            <div className="text-sm">{order.contactEmail || "—"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-neutral-500">
              Teléfono
            </div>
            <div className="text-sm">{order.contactPhone || "—"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-neutral-500">
              Pago
            </div>
            <div className="text-sm">{paymentLabel}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-neutral-500">
              Envío
            </div>
            <div className="text-sm">{shippingLabel}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-neutral-500">
              Subtotal
            </div>
            <div className="text-sm">{CLP(order.subtotal)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-neutral-500">
              Costo envío
            </div>
            <div className="text-sm">{CLP(order.shippingCost ?? 0)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-neutral-500">
              Total
            </div>
            <div className="text-sm font-bold text-lime-400">
              {CLP(order.total)}
            </div>
          </div>
        </div>
      </section>

      {/* Productos */}
      <section className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        <h2 className="mb-3 text-base font-semibold text-white">Productos</h2>
        {order.items.length === 0 ? (
          <p className="text-neutral-400 text-sm">Sin items asociados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-neutral-900">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Producto</th>
                  <th className="px-3 py-2 text-right font-semibold">Cantidad</th>
                  <th className="px-3 py-2 text-right font-semibold">Precio</th>
                  <th className="px-3 py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-t border-neutral-800">
                    <td className="px-3 py-2 align-top text-sm">
                      {item.productName}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-sm">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-sm">
                      {CLP(item.unitPrice)}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-sm">
                      {CLP(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Estado + nota interna / mensaje para cliente */}
         <AdminOrderStatusForm
         orderId={order.id}
         currentStatus={order.status as any}
             currentNotes={order.notes}
                />
    </main>
  );
}
