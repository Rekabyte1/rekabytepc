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
  }).format(Number(value || 0));
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
  DELIVERED: "Entregado",
  COMPLETED: "Completado / entregado",
  CANCELLED: "Cancelado",
};

function statusTone(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "border-amber-400/30 bg-amber-400/10 text-amber-200";
    case "PAID":
      return "border-lime-400/30 bg-lime-400/10 text-lime-200";
    case "PREPARING":
      return "border-sky-400/30 bg-sky-400/10 text-sky-200";
    case "SHIPPED":
      return "border-indigo-400/30 bg-indigo-400/10 text-indigo-200";
    case "DELIVERED":
    case "COMPLETED":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
    case "CANCELLED":
      return "border-red-400/30 bg-red-400/10 text-red-200";
    default:
      return "border-neutral-700 bg-black/10 text-neutral-200";
  }
}

type PageProps = {
  params: { id: string };
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const orderId = params.id;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      shipment: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!order) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-100">
        <h1 className="mb-4 text-2xl font-extrabold text-white">
          Pedido no encontrado
        </h1>
        <Link href="/admin/pedidos" className="text-lime-400 font-extrabold">
          ← Volver a pedidos
        </Link>
      </main>
    );
  }

  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod;
  const shippingLabel = SHIPPING_LABELS[order.shippingMethod] ?? order.shippingMethod;
  const statusLabel = STATUS_LABELS[order.status] ?? order.status;

  const createdAt = new Date(order.createdAt).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const totalItems = order.items.reduce((a, it) => a + (it.quantity || 0), 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-100">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/admin/pedidos" className="text-xs text-lime-300 font-extrabold">
            ← Volver a pedidos
          </Link>

          <h1 className="mt-2 text-2xl font-extrabold text-white">
            Pedido{" "}
            <span className="font-mono text-base text-neutral-400">{order.id}</span>
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center rounded-full border px-2 py-1 text-xs font-extrabold",
                statusTone(order.status),
              ].join(" ")}
            >
              {statusLabel}
            </span>

            <span className="inline-flex items-center rounded-full border border-neutral-800 bg-black/20 px-2 py-1 text-xs font-extrabold text-neutral-200">
              {shippingLabel}
            </span>

            <span className="inline-flex items-center rounded-full border border-neutral-800 bg-black/20 px-2 py-1 text-xs font-extrabold text-neutral-200">
              {paymentLabel}
            </span>

            <span className="inline-flex items-center rounded-full border border-neutral-800 bg-black/20 px-2 py-1 text-xs font-extrabold text-neutral-200">
              {totalItems} item{totalItems === 1 ? "" : "s"}
            </span>
          </div>

          <p className="mt-2 text-xs text-neutral-400">
            Creado el <span className="text-neutral-200 font-bold">{createdAt}</span>
          </p>

          {order.user?.id ? (
            <p className="mt-1 text-xs text-neutral-400">
              Usuario asociado:{" "}
              <span className="text-neutral-200 font-bold">
                {order.user.email ?? order.user.id}
              </span>
            </p>
          ) : (
            <p className="mt-1 text-xs text-neutral-500">
              Pedido sin usuario asociado (guest).
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-4 min-w-[260px]">
          <div className="text-[11px] font-extrabold tracking-wide text-neutral-400">
            RESUMEN
          </div>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Subtotal</span>
              <span className="text-neutral-200 font-bold">{CLP(order.subtotal)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Envío</span>
              <span className="text-neutral-200 font-bold">{CLP(order.shippingCost ?? 0)}</span>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-neutral-800 pt-3">
              <span className="text-neutral-200 font-extrabold">TOTAL</span>
              <span className="text-lime-300 font-extrabold">{CLP(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle */}
      <section className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-950/55 p-5">
        <h2 className="mb-3 text-base font-extrabold text-white">Datos del cliente</h2>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Info label="Cliente" value={order.contactName || "—"} />
          <Info label="Correo" value={order.contactEmail || "—"} />
          <Info label="Teléfono" value={order.contactPhone || "—"} />
          <Info label="Pago" value={paymentLabel} />
          <Info label="Envío" value={shippingLabel} />
          <Info label="Notas" value={order.notes || "—"} />
        </div>

        {order.shipment ? (
          <div className="mt-5 rounded-2xl border border-neutral-800 bg-black/20 p-4">
            <div className="text-[11px] font-extrabold tracking-wide text-neutral-400">
              ENVÍO (shipment)
            </div>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <Info label="Tipo" value={order.shipment.type} />
              <Info label="Estado" value={order.shipment.status} />
              <Info label="Tracking" value={order.shipment.trackingCode || "—"} />
              <Info
                label="PickupLocation"
                value={order.shipment.pickupLocation || "—"}
              />
            </div>
          </div>
        ) : null}
      </section>

      {/* Productos */}
      <section className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-950/55 p-5">
        <h2 className="mb-3 text-base font-extrabold text-white">Productos</h2>

        {order.items.length === 0 ? (
          <p className="text-neutral-400 text-sm">Sin items asociados.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-black/25">
                <tr className="border-b border-neutral-800">
                  <th className="px-3 py-3 text-left font-extrabold text-neutral-200">Producto</th>
                  <th className="px-3 py-3 text-right font-extrabold text-neutral-200">Cantidad</th>
                  <th className="px-3 py-3 text-right font-extrabold text-neutral-200">Precio</th>
                  <th className="px-3 py-3 text-right font-extrabold text-neutral-200">Total</th>
                </tr>
              </thead>

              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-t border-neutral-900">
                    <td className="px-3 py-3 align-top text-sm text-neutral-100">
                      {item.productName}
                    </td>
                    <td className="px-3 py-3 align-top text-right text-sm text-neutral-200">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-3 align-top text-right text-sm text-neutral-200">
                      {CLP(item.unitPrice)}
                    </td>
                    <td className="px-3 py-3 align-top text-right text-sm font-extrabold text-neutral-100">
                      {CLP(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Estado (tu componente) */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-5">
        <h2 className="mb-3 text-base font-extrabold text-white">Estado del pedido</h2>

        <AdminOrderStatusForm
          orderId={order.id}
          currentStatus={order.status as any}
          currentNotes={order.notes}
        />
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-black/20 p-3">
      <div className="text-[11px] font-extrabold tracking-wide text-neutral-500">
        {label.toUpperCase()}
      </div>
      <div className="mt-1 text-sm font-bold text-neutral-200 break-words">
        {value}
      </div>
    </div>
  );
}
