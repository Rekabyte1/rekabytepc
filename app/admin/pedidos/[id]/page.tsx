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

function paymentTone(method: string) {
  if (method === "TRANSFER") return "border-sky-400/30 bg-sky-400/10 text-sky-200";
  if (method === "CARD") return "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200";
  return "border-neutral-800 bg-black/20 text-neutral-200";
}

function shippingTone(method: string) {
  if (method === "DELIVERY") return "border-indigo-400/30 bg-indigo-400/10 text-indigo-200";
  if (method === "PICKUP") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  return "border-neutral-800 bg-black/20 text-neutral-200";
}

function shortId(id: string) {
  const s = String(id || "");
  return s.length <= 10 ? s : `${s.slice(0, 6)}…${s.slice(-4)}`;
}

// ✅ Next.js App Router (Next 15): params NO es Promise.
// Agrego searchParams opcional para evitar mismatches de types generados.
type PageProps = {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const orderId = params.id;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { id: true, email: true, name: true, lastName: true, rut: true, phone: true } },
      payment: true,
      shipment: {
        include: {
          address: true,
        },
      },
    },
  });

  if (!order) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-100">
        <h1 className="mb-4 text-2xl font-extrabold text-white">Pedido no encontrado</h1>
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

  const updatedAt = new Date(order.updatedAt).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const totalItems = order.items.reduce((a, it) => a + (it.quantity || 0), 0);

  const customerName =
    order.contactName || [order.user?.name, order.user?.lastName].filter(Boolean).join(" ") || "—";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-100">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3">
        <Link href="/admin/pedidos" className="text-xs text-lime-300 font-extrabold w-fit">
          ← Volver a pedidos
        </Link>

        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-white">
              Pedido{" "}
              <span className="font-mono text-base text-neutral-400 break-all">{order.id}</span>
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(order.status)}>{statusLabel}</Badge>
              <Badge tone={shippingTone(order.shippingMethod)}>{shippingLabel}</Badge>
              <Badge tone={paymentTone(order.paymentMethod)}>{paymentLabel}</Badge>
              <Badge tone="border-neutral-800 bg-black/20 text-neutral-200">
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </Badge>
              {order.confirmationEmailSentAt ? (
                <Badge tone="border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
                  Confirmación enviada
                </Badge>
              ) : (
                <Badge tone="border-neutral-800 bg-black/20 text-neutral-300">
                  Confirmación no enviada
                </Badge>
              )}
            </div>

            <p className="mt-2 text-xs text-neutral-400">
              Creado el <span className="text-neutral-200 font-bold">{createdAt}</span>
              {" · "}
              Última actualización <span className="text-neutral-200 font-bold">{updatedAt}</span>
            </p>

            {order.user?.id ? (
              <p className="mt-1 text-xs text-neutral-400">
                Usuario asociado:{" "}
                <span className="text-neutral-200 font-bold">
                  {order.user.email ?? order.user.id}
                </span>
              </p>
            ) : (
              <p className="mt-1 text-xs text-neutral-500">Pedido sin usuario asociado (guest).</p>
            )}
          </div>

          {/* Top right mini summary (mobile) */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-4 md:min-w-[280px]">
            <div className="text-[11px] font-extrabold tracking-wide text-neutral-400">RESUMEN</div>

            <div className="mt-3 space-y-2 text-sm">
              <Row label="Subtotal" value={CLP(order.subtotal)} />
              <Row label="Envío" value={CLP(order.shippingCost ?? 0)} />
              <div className="mt-2 flex items-center justify-between border-t border-neutral-800 pt-3">
                <span className="text-neutral-200 font-extrabold">TOTAL</span>
                <span className="text-lime-300 font-extrabold">{CLP(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2 columns layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Productos */}
          <Card>
            <CardHeader title="Productos" />
            {order.items.length === 0 ? (
              <p className="text-neutral-400 text-sm">Sin items asociados.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-neutral-800">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-black/25">
                    <tr className="border-b border-neutral-800">
                      <th className="px-4 py-3 text-left text-xs font-extrabold tracking-wide text-neutral-300">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-extrabold tracking-wide text-neutral-300">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-extrabold tracking-wide text-neutral-300">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-extrabold tracking-wide text-neutral-300">
                        Subtotal
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {order.items.map((item) => {
                      const rowTotal = Number(item.unitPrice || 0) * Number(item.quantity || 0);
                      return (
                        <tr key={item.id} className="border-t border-neutral-900 hover:bg-white/[0.03]">
                          <td className="px-4 py-3 align-top text-neutral-100">
                            <div className="font-bold">{item.productName}</div>
                            <div className="mt-0.5 text-xs text-neutral-500">
                              {shortId(item.productId)}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top text-right text-neutral-200">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 align-top text-right text-neutral-200">
                            {CLP(item.unitPrice)}
                          </td>
                          <td className="px-4 py-3 align-top text-right font-extrabold text-neutral-100">
                            {CLP(rowTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Envío / Dirección */}
          <Card>
            <CardHeader title="Envío" />

            {order.shippingMethod === "PICKUP" ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Info label="Método" value={shippingLabel} />
                <Info label="PickupLocation" value={order.shipment?.pickupLocation || "—"} />
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <Info label="Método" value={shippingLabel} />
                  <Info label="Costo" value={CLP(order.shippingCost ?? 0)} />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Info label="Estado envío" value={order.shipment?.status || "—"} />
                  <Info label="Tracking" value={order.shipment?.trackingCode || "—"} />
                  <Info
                    label="Fecha estimada"
                    value={
                      order.shipment?.estimatedDate
                        ? new Date(order.shipment.estimatedDate).toLocaleDateString("es-CL", {
                            dateStyle: "medium",
                          })
                        : "—"
                    }
                  />
                  <Info label="Tipo (Shipment)" value={order.shipment?.type || "—"} />
                </div>

                <div className="mt-4 rounded-2xl border border-neutral-800 bg-black/20 p-4">
                  <div className="text-[11px] font-extrabold tracking-wide text-neutral-400">
                    DIRECCIÓN
                  </div>

                  {order.shipment?.address ? (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <Info label="Nombre" value={order.shipment.address.fullName || "—"} />
                      <Info label="Teléfono" value={order.shipment.address.phone || "—"} />
                      <Info
                        label="Dirección"
                        value={[
                          order.shipment.address.street,
                          order.shipment.address.number,
                          order.shipment.address.apartment,
                        ]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      />
                      <Info
                        label="Comuna / Ciudad"
                        value={[order.shipment.address.commune, order.shipment.address.city]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      />
                      <Info label="Región" value={order.shipment.address.region || "—"} />
                      <Info label="País" value={order.shipment.address.country || "Chile"} />
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-neutral-400">
                      No hay dirección asociada al envío (addressId vacío).
                    </p>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-1 space-y-6">
          {/* Sticky column */}
          <div className="space-y-6 lg:sticky lg:top-6">
            {/* Resumen */}
            <Card>
              <CardHeader title="Resumen" subtle />
              <div className="space-y-2 text-sm">
                <Row label="Subtotal" value={CLP(order.subtotal)} />
                <Row label="Envío" value={CLP(order.shippingCost ?? 0)} />
                <div className="mt-2 flex items-center justify-between border-t border-neutral-800 pt-3">
                  <span className="text-neutral-200 font-extrabold">TOTAL</span>
                  <span className="text-lime-300 font-extrabold">{CLP(order.total)}</span>
                </div>
              </div>
            </Card>

            {/* Información de orden */}
            <Card>
              <CardHeader title="Información de orden" subtle />
              <div className="grid gap-3">
                <Info label="Cliente" value={customerName || "—"} />
                <Info label="Correo" value={order.contactEmail || "—"} />
                <Info label="Teléfono" value={order.contactPhone || "—"} />
                <div className="grid grid-cols-2 gap-3">
                  <Info label="Pago" value={paymentLabel} />
                  <Info label="Envío" value={shippingLabel} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Info label="Estado" value={statusLabel} />
                  <Info label="ID corto" value={shortId(order.id)} />
                </div>
                <Info label="Notas" value={order.notes || "—"} />
              </div>
            </Card>

            {/* Estado / Acciones */}
            <Card>
              <CardHeader title="Acciones" />
              <AdminOrderStatusForm
                orderId={order.id}
                currentStatus={order.status as any}
                currentNotes={order.notes}
              />
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

/* UI helpers */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-5">
      {children}
    </section>
  );
}

function CardHeader({ title, subtle }: { title: string; subtle?: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2
        className={
          subtle
            ? "text-sm font-extrabold text-neutral-200"
            : "text-base font-extrabold text-white"
        }
      >
        {title}
      </h2>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-black/20 p-3">
      <div className="text-[11px] font-extrabold tracking-wide text-neutral-500">
        {label.toUpperCase()}
      </div>
      <div className="mt-1 text-sm font-bold text-neutral-200 break-words">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-400">{label}</span>
      <span className="text-neutral-200 font-bold">{value}</span>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: string }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-1 text-xs font-extrabold",
        tone,
      ].join(" ")}
    >
      {children}
    </span>
  );
}