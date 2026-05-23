import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminLatestOrder = {
  id: string;
  createdAt: Date;
  status: string;
  paymentMethod: string;
  contactName: string;
  contactEmail: string;
  total: number;
};
const ACTIVE_PROCESSED_STATUSES = ["PREPARING", "SHIPPED", "DELIVERED", "COMPLETED"] as const;
const PREPARE_STATUSES = ["PAID", "PREPARING"] as const;
const CONFIRMED_SALE_STATUSES = ["PAID", "PREPARING", "SHIPPED", "DELIVERED", "COMPLETED"] as const;

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pendiente de pago",
  PAID: "Pagado",
  PREPARING: "Preparando",
  SHIPPED: "Despachado",
  DELIVERED: "Entregado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

const PAYMENT_LABELS: Record<string, string> = {
  TRANSFER: "Transferencia",
  CARD: "Tarjeta",
};

function CLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function shortId(id: string) {
  if (!id) return "—";
  return id.length <= 14 ? id : `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function ageLabel(date: Date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 1) return `${days} día${days === 1 ? "" : "s"}`;
  if (hours >= 1) return `${hours} h`;
  return `${minutes} min`;
}

function dateTimeLabel(date: Date) {
  return new Date(date).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function statusTone(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "border-amber-400/30 bg-amber-400/10 text-amber-200";
    case "PAID":
      return "border-lime-400/30 bg-lime-400/10 text-lime-200";
    case "PREPARING":
      return "border-sky-400/30 bg-sky-400/10 text-sky-200";
    case "SHIPPED":
    case "DELIVERED":
    case "COMPLETED":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
    case "CANCELLED":
      return "border-red-400/30 bg-red-400/10 text-red-200";
    default:
      return "border-neutral-700 bg-black/20 text-neutral-200";
  }
}

function chileTodayRange() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  const date = `${year}-${month}-${day}`;

  return {
    start: new Date(`${date}T00:00:00-04:00`),
    end: new Date(`${date}T23:59:59.999-04:00`),
  };
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const today = chileTodayRange();
  const preparingOldLimit = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const [
    todayOrders,
    pendingPayment,
    paidOrders,
    preparingOrders,
    processedOrders,
    productsToPrepare,
    expiredPendingOrders,
    cancelledToday,
    todayConfirmedSales,
    actionOrders,
    latestOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: {
          gte: today.start,
          lte: today.end,
        },
      },
    }),

    prisma.order.count({
      where: {
        status: "PENDING_PAYMENT",
      },
    }),

    prisma.order.count({
      where: {
        status: "PAID",
      },
    }),

    prisma.order.count({
      where: {
        status: "PREPARING",
      },
    }),

    prisma.order.count({
      where: {
        status: {
          in: [...ACTIVE_PROCESSED_STATUSES],
        },
      },
    }),

    prisma.orderItem.aggregate({
      where: {
        order: {
          status: {
            in: [...PREPARE_STATUSES],
          },
        },
      },
      _sum: {
        quantity: true,
      },
    }),

    prisma.order.count({
      where: {
        status: "PENDING_PAYMENT",
        paymentDueAt: {
          lt: now,
        },
      },
    }),

    prisma.order.count({
      where: {
        status: "CANCELLED",
        updatedAt: {
          gte: today.start,
          lte: today.end,
        },
      },
    }),

    prisma.order.aggregate({
      where: {
        status: {
          in: [...CONFIRMED_SALE_STATUSES],
        },
        createdAt: {
          gte: today.start,
          lte: today.end,
        },
      },
      _count: {
        _all: true,
      },
      _sum: {
        total: true,
      },
    }),

    prisma.order.findMany({
      where: {
        OR: [
          {
            status: "PENDING_PAYMENT",
            paymentDueAt: {
              lt: now,
            },
          },
          {
            status: "PAID",
          },
          {
            status: "PREPARING",
            createdAt: {
              lt: preparingOldLimit,
            },
          },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 12,
      select: {
        id: true,
        createdAt: true,
        paymentDueAt: true,
        status: true,
        paymentMethod: true,
        contactName: true,
        contactEmail: true,
        total: true,
      },
    }),

    prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        status: true,
        paymentMethod: true,
        contactName: true,
        contactEmail: true,
        total: true,
      },
    }),
  ]);

  const sortedActions = [...actionOrders].sort((a, b) => {
    const priority = (order: (typeof actionOrders)[number]) => {
      if (order.status === "PENDING_PAYMENT" && order.paymentDueAt && order.paymentDueAt < now) return 1;
      if (order.status === "PAID") return 2;
      if (order.status === "PREPARING") return 3;
      return 9;
    };

    const p = priority(a) - priority(b);
    if (p !== 0) return p;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const mainKpis = [
    {
      label: "Pedidos de hoy",
      value: todayOrders,
      hint: "Pedidos creados durante el día",
      tone: "text-white",
    },
    {
      label: "Pendientes de pago",
      value: pendingPayment,
      hint: "Status PENDING_PAYMENT",
      tone: "text-amber-200",
    },
    {
      label: "Por procesar",
      value: paidOrders,
      hint: "Status PAID",
      tone: "text-lime-200",
    },
    {
      label: "Preparando",
      value: preparingOrders,
      hint: "Status PREPARING",
      tone: "text-sky-200",
    },
    {
      label: "Procesados",
      value: processedOrders,
      hint: "Preparing + enviados/entregados",
      tone: "text-emerald-200",
    },
    {
      label: "Productos por preparar",
      value: productsToPrepare._sum.quantity ?? 0,
      hint: "Items en PAID + PREPARING",
      tone: "text-lime-300",
    },
  ];

  const secondaryKpis = [
    {
      label: "Ventas confirmadas hoy",
      value: todayConfirmedSales._count._all,
      hint: "Pedidos activos pagados/confirmados",
      tone: "text-lime-200",
    },
    {
      label: "Ingresos confirmados hoy",
      value: CLP(todayConfirmedSales._sum.total ?? 0),
      hint: "Total de pedidos activos de hoy",
      tone: "text-lime-300",
    },
    {
      label: "Pedidos vencidos",
      value: expiredPendingOrders,
      hint: "PENDING_PAYMENT con paymentDueAt vencido",
      tone: "text-red-200",
    },
    {
      label: "Cancelados hoy",
      value: cancelledToday,
      hint: "Cancelados actualizados durante el día",
      tone: "text-neutral-300",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-100">
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/60 p-5 md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_260px_at_5%_0%,rgba(163,230,53,0.13),transparent_60%)]" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-lime-300">
              RekaByte Admin
            </p>
            <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">
              Dashboard operativo
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
              Vista rápida para responder qué debes revisar hoy: pagos, pedidos por procesar,
              productos pendientes y últimas señales comerciales.
            </p>
          </div>

          <Link
            href="/admin/pedidos"
            className="inline-flex w-fit items-center justify-center rounded-2xl bg-lime-400 px-5 py-3 text-sm font-black text-black hover:bg-lime-300"
          >
            Ir a pedidos
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {mainKpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {secondaryKpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60">
          <div className="border-b border-neutral-800 p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
              Requieren acción
            </p>
            <h2 className="mt-2 text-xl font-black text-white">Cola priorizada</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Prioridad: pagos vencidos, pedidos pagados sin procesar y pedidos en preparación antiguos.
            </p>
          </div>

          {sortedActions.length === 0 ? (
            <div className="p-6 text-sm text-neutral-400">
              No hay pedidos críticos pendientes en este momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead className="border-b border-neutral-800 bg-black/20">
                  <tr>
                    <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Pedido</th>
                    <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Cliente</th>
                    <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Total</th>
                    <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Estado</th>
                    <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Pago</th>
                    <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Antigüedad</th>
                    <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedActions.map((order) => (
                    <tr key={order.id} className="border-t border-neutral-900 hover:bg-white/[0.03]">
                      <td className="px-4 py-3 font-mono text-[11px] text-neutral-400">
                        {shortId(order.id)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-neutral-100">{order.contactName || "—"}</div>
                        <div className="mt-1 text-[11px] text-neutral-500">
                          {order.contactEmail || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                        {CLP(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                      </td>
                      <td className="px-4 py-3 text-neutral-300">{ageLabel(order.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="inline-flex rounded-xl border border-lime-400/30 bg-lime-400/10 px-3 py-2 font-extrabold text-lime-200 hover:bg-lime-400/15"
                        >
                          Ver pedido
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60">
          <div className="border-b border-neutral-800 p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
              Últimos pedidos
            </p>
            <h2 className="mt-2 text-xl font-black text-white">Actividad reciente</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Últimos 5 pedidos registrados en la tienda.
            </p>
          </div>

          {latestOrders.length === 0 ? (
            <div className="p-6 text-sm text-neutral-400">No hay pedidos registrados.</div>
          ) : (
            <div className="divide-y divide-neutral-900">
              {latestOrders.map((order: AdminLatestOrder) => (
                <div key={order.id} className="p-4 hover:bg-white/[0.03]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] text-neutral-500">
                        {shortId(order.id)}
                      </div>
                      <div className="mt-1 font-extrabold text-neutral-100">
                        {order.contactName || "—"}
                      </div>
                      <div className="mt-1 truncate text-xs text-neutral-500">
                        {order.contactEmail || "—"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-neutral-100">{CLP(order.total)}</div>
                      <div className="mt-1 text-[11px] text-neutral-500">
                        {dateTimeLabel(order.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={order.status} />
                      <span className="rounded-full border border-neutral-800 bg-black/20 px-2 py-1 text-[11px] font-extrabold text-neutral-300">
                        {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                      </span>
                    </div>

                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="text-xs font-extrabold text-lime-300 hover:text-lime-200"
                    >
                      Ver pedido →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint: string;
  tone: string;
}) {
  return (
    <article className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-neutral-500">
        {label}
      </p>
      <div className={`mt-3 text-3xl font-black ${tone}`}>{value}</div>
      <p className="mt-2 text-xs leading-5 text-neutral-500">{hint}</p>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2 py-1 text-[11px] font-extrabold",
        statusTone(status),
      ].join(" ")}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}