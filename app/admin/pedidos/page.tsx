import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function CLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pendiente",
  PAID: "Pagado",
  PREPARING: "Preparando",
  SHIPPED: "Despachado",
  DELIVERED: "Entregado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

const PAYMENT_LABELS: Record<string, string> = {
  TRANSFER: "Transfer",
  CARD: "Card",
};

const SHIPPING_LABELS: Record<string, string> = {
  PICKUP: "Pickup",
  DELIVERY: "Delivery",
};

function chipClass(kind: "status" | "payment" | "shipping", value: string) {
  if (kind === "status") {
    switch (value) {
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

  if (kind === "payment") {
    return value === "TRANSFER"
      ? "border-lime-400/30 bg-lime-400/10 text-lime-200"
      : "border-neutral-700 bg-black/10 text-neutral-200";
  }

  return value === "DELIVERY"
    ? "border-sky-400/30 bg-sky-400/10 text-sky-200"
    : "border-neutral-700 bg-black/10 text-neutral-200";
}

type SearchParams = {
  q?: string;
  status?: string;
  payment?: string;
  shipping?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
};

function shortId(id: string) {
  if (!id) return "—";
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

function safeDateLabel(d: Date) {
  return new Date(d).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/**
 * Interpreta el date input como hora Chile (-03:00) para que el filtro sea intuitivo.
 * Esto evita el “corrimiento” típico cuando se usa UTC (Z).
 */
function chileDateRange(from?: string, to?: string) {
  const out: { gte?: Date; lte?: Date } = {};
  if (from) out.gte = new Date(`${from}T00:00:00-03:00`);
  if (to) out.lte = new Date(`${to}T23:59:59-03:00`);
  return out;
}

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const status = (sp.status ?? "").trim();
  const payment = (sp.payment ?? "").trim();
  const shipping = (sp.shipping ?? "").trim();

  const sort = (sp.sort ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";

  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(10, Number(sp.pageSize ?? 20) || 20));
  const skip = (page - 1) * pageSize;

  // Fechas opcionales (sin defaults forzados)
  const from = (sp.from ?? "").trim(); // yyyy-mm-dd o ""
  const to = (sp.to ?? "").trim(); // yyyy-mm-dd o ""

  const where: any = {};

  if (status) where.status = status;
  if (payment) where.paymentMethod = payment;
  if (shipping) where.shippingMethod = shipping;

  if (from || to) {
    const r = chileDateRange(from || undefined, to || undefined);
    where.createdAt = {};
    if (r.gte) where.createdAt.gte = r.gte;
    if (r.lte) where.createdAt.lte = r.lte;
  }

  if (q) {
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { contactName: { contains: q, mode: "insensitive" } },
      { contactEmail: { contains: q, mode: "insensitive" } },
      { contactPhone: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
    ];
  }

  const whereForStats = { ...where };

  const [totalCount, orders, statusAgg] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: sort },
      skip,
      take: pageSize,
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
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: whereForStats,
      _count: { _all: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const countsByStatus = statusAgg.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});

  function buildLink(next: Partial<SearchParams>) {
    const sp2 = new URLSearchParams();

    const merged: SearchParams = {
      q,
      status,
      payment,
      shipping,
      sort,
      page: String(page),
      pageSize: String(pageSize),
      from: from || "",
      to: to || "",
      ...next,
    };

    Object.entries(merged).forEach(([k, v]) => {
      if (v == null) return;
      const s = String(v).trim();
      if (!s) return;
      sp2.set(k, s);
    });

    return `/admin/pedidos?${sp2.toString()}`;
  }

  // Clases “blindadas” para inputs date en dark (texto visible + icono visible)
  const dateInputClass =
    "mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40 " +
    "[color-scheme:dark] " +
    "[&::-webkit-calendar-picker-indicator]:invert " +
    "[&::-webkit-calendar-picker-indicator]:opacity-80 " +
    "[&::-webkit-calendar-picker-indicator]:hover:opacity-100";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-100">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Pedidos</h1>
          <p className="mt-1 text-neutral-400">
            Gestión de pedidos registrados en la tienda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
            <div className="text-[11px] font-extrabold tracking-wide text-neutral-500">
              TOTAL
            </div>
            <div className="text-sm font-extrabold text-neutral-100">
              {totalCount}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
            <div className="text-[11px] font-extrabold tracking-wide text-neutral-500">
              PENDIENTES
            </div>
            <div className="text-sm font-extrabold text-amber-200">
              {countsByStatus["PENDING_PAYMENT"] ?? 0}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
            <div className="text-[11px] font-extrabold tracking-wide text-neutral-500">
              PAGADOS
            </div>
            <div className="text-sm font-extrabold text-lime-200">
              {countsByStatus["PAID"] ?? 0}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
            <div className="text-[11px] font-extrabold tracking-wide text-neutral-500">
              CANCELADOS
            </div>
            <div className="text-sm font-extrabold text-red-200">
              {countsByStatus["CANCELLED"] ?? 0}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2">
            <div className="text-[11px] font-extrabold tracking-wide text-neutral-500">
              PÁGINA
            </div>
            <div className="text-sm font-extrabold text-neutral-100">
              {page}/{totalPages}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <form
        action="/admin/pedidos"
        method="GET"
        className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-950/55 p-3"
      >
        <div className="flex flex-wrap items-end gap-2">
          {/* Buscar */}
          <div className="min-w-[240px] flex-1">
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-500">
              Buscar
            </label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-neutral-800 bg-black/25 px-3 py-2">
              <span className="text-neutral-500">⌕</span>
              <input
                name="q"
                defaultValue={q}
                placeholder="ID, cliente, email, nota…"
                className="w-full bg-transparent text-sm text-neutral-200 outline-none placeholder:text-neutral-600"
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="min-w-[260px]">
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-500">
              Fecha
            </label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] font-extrabold text-neutral-600">
                  Desde
                </div>
                <input
                  type="date"
                  name="from"
                  defaultValue={from || ""}
                  className={dateInputClass}
                />
              </div>

              <div>
                <div className="text-[10px] font-extrabold text-neutral-600">
                  Hasta
                </div>
                <input
                  type="date"
                  name="to"
                  defaultValue={to || ""}
                  className={dateInputClass}
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="min-w-[180px]">
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-500">
              Estado
            </label>
            <select
              name="status"
              defaultValue={status}
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40"
            >
              <option value="">Todos</option>
              {Object.keys(STATUS_LABELS).map((k) => (
                <option key={k} value={k}>
                  {STATUS_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          {/* Pago */}
          <div className="min-w-[160px]">
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-500">
              Pago
            </label>
            <select
              name="payment"
              defaultValue={payment}
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40"
            >
              <option value="">Todos</option>
              <option value="TRANSFER">Transfer</option>
              <option value="CARD">Card</option>
            </select>
          </div>

          {/* Envío */}
          <div className="min-w-[160px]">
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-500">
              Envío
            </label>
            <select
              name="shipping"
              defaultValue={shipping}
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40"
            >
              <option value="">Todos</option>
              <option value="PICKUP">Pickup</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>

          {/* Orden / PageSize */}
          <div className="min-w-[150px]">
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-500">
              Orden
            </label>
            <select
              name="sort"
              defaultValue={sort}
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40"
            >
              <option value="desc">Más nuevos</option>
              <option value="asc">Más antiguos</option>
            </select>
          </div>

          <div className="min-w-[140px]">
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-500">
              Por página
            </label>
            <select
              name="pageSize"
              defaultValue={String(pageSize)}
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="h-[42px] rounded-xl bg-lime-400 px-4 text-sm font-extrabold text-black hover:bg-lime-300"
            >
              Aplicar
            </button>

            <Link
              href="/admin/pedidos"
              className="h-[42px] inline-flex items-center rounded-xl border border-neutral-800 bg-black/20 px-4 text-sm font-extrabold text-neutral-200 hover:bg-black/30"
            >
              Limpiar
            </Link>
          </div>
        </div>
      </form>

      {/* Tabla */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-6 text-neutral-300">
          No hay pedidos para estos filtros.
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/55">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-800 px-4 py-3">
            <div className="text-xs text-neutral-400">
              Mostrando{" "}
              <span className="text-neutral-200 font-bold">
                {Math.min(skip + 1, totalCount)}–
                {Math.min(skip + orders.length, totalCount)}
              </span>{" "}
              de <span className="text-neutral-200 font-bold">{totalCount}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3 text-left font-extrabold text-neutral-300">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left font-extrabold text-neutral-300">
                    Pedido
                  </th>
                  <th className="px-4 py-3 text-left font-extrabold text-neutral-300">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left font-extrabold text-neutral-300">
                    Contacto
                  </th>
                  <th className="px-4 py-3 text-left font-extrabold text-neutral-300">
                    Pago
                  </th>
                  <th className="px-4 py-3 text-left font-extrabold text-neutral-300">
                    Envío
                  </th>
                  <th className="px-4 py-3 text-right font-extrabold text-neutral-300">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left font-extrabold text-neutral-300">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right font-extrabold text-neutral-300">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-neutral-900 hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3 align-top text-neutral-200 whitespace-nowrap">
                      {safeDateLabel(o.createdAt)}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="font-mono text-[11px] text-neutral-400">
                        {shortId(o.id)}
                      </div>
                      {o.notes ? (
                        <div className="mt-1 line-clamp-2 text-[11px] text-neutral-500">
                          {o.notes}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="font-bold text-neutral-100">
                        {o.contactName || "—"}
                      </div>
                      <div className="mt-1 text-[11px] text-neutral-500">
                        {o.contactEmail || "—"}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top text-[12px]">
                      <div className="text-neutral-200">
                        {o.contactEmail || "—"}
                      </div>
                      {o.contactPhone ? (
                        <div className="text-neutral-500">{o.contactPhone}</div>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-extrabold",
                          chipClass("payment", o.paymentMethod),
                        ].join(" ")}
                      >
                        {PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-extrabold",
                          chipClass("shipping", o.shippingMethod),
                        ].join(" ")}
                      >
                        {SHIPPING_LABELS[o.shippingMethod] ?? o.shippingMethod}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top text-right font-extrabold text-neutral-100 whitespace-nowrap">
                      {CLP(o.total)}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-extrabold",
                          chipClass("status", o.status),
                        ].join(" ")}
                      >
                        {STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top text-right">
                      <Link
                        href={`/admin/pedidos/${o.id}`}
                        className="inline-flex items-center rounded-lg border border-lime-400/30 bg-lime-400/10 px-3 py-2 text-xs font-extrabold text-lime-200 hover:bg-lime-400/15"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 px-4 py-3">
            <div className="text-xs text-neutral-400">
              Página{" "}
              <span className="text-neutral-200 font-bold">
                {page}/{totalPages}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                aria-disabled={page <= 1}
                className={[
                  "rounded-xl border px-3 py-2 text-xs font-extrabold",
                  page <= 1
                    ? "border-neutral-800 bg-black/10 text-neutral-600 pointer-events-none"
                    : "border-neutral-800 bg-black/20 text-neutral-200 hover:bg-black/30",
                ].join(" ")}
                href={buildLink({ page: String(Math.max(1, page - 1)) })}
              >
                ← Anterior
              </Link>

              <Link
                aria-disabled={page >= totalPages}
                className={[
                  "rounded-xl border px-3 py-2 text-xs font-extrabold",
                  page >= totalPages
                    ? "border-neutral-800 bg-black/10 text-neutral-600 pointer-events-none"
                    : "border-neutral-800 bg-black/20 text-neutral-200 hover:bg-black/30",
                ].join(" ")}
                href={buildLink({ page: String(Math.min(totalPages, page + 1)) })}
              >
                Siguiente →
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}