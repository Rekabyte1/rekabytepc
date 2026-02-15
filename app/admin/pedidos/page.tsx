// app/admin/pedidos/page.tsx
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

function toISODateInput(d: Date) {
  // yyyy-mm-dd (para input type="date")
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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

  // shipping
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
  to?: string;   // yyyy-mm-dd
};

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = (searchParams.q ?? "").trim();
  const status = (searchParams.status ?? "").trim();
  const payment = (searchParams.payment ?? "").trim();
  const shipping = (searchParams.shipping ?? "").trim();

  const sort = (searchParams.sort ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";

  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(10, Number(searchParams.pageSize ?? 20) || 20));
  const skip = (page - 1) * pageSize;

  // rango fechas opcional
  const from = (searchParams.from ?? "").trim();
  const to = (searchParams.to ?? "").trim();

  const where: any = {};

  if (status) where.status = status;
  if (payment) where.paymentMethod = payment;
  if (shipping) where.shippingMethod = shipping;

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(`${from}T00:00:00.000Z`);
    if (to) where.createdAt.lte = new Date(`${to}T23:59:59.999Z`);
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

  const [totalCount, orders] = await Promise.all([
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
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // defaults para filtros UI
  const today = new Date();
  const last30 = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);

  const fromDefault = from || toISODateInput(last30);
  const toDefault = to || toISODateInput(today);

  function buildLink(next: Partial<SearchParams>) {
    const sp = new URLSearchParams();

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

    // limpia vacíos
    Object.entries(merged).forEach(([k, v]) => {
      if (v == null) return;
      const s = String(v).trim();
      if (!s) return;
      sp.set(k, s);
    });

    return `/admin/pedidos?${sp.toString()}`;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-100">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Panel administrador</h1>
          <p className="mt-1 text-neutral-300">
            Pedidos guardados en Supabase. Filtra, busca y revisa detalle.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="rounded-full border border-neutral-800 bg-black/20 px-3 py-1">
            Total: <span className="text-neutral-200 font-bold">{totalCount}</span>
          </span>
          <span className="rounded-full border border-neutral-800 bg-black/20 px-3 py-1">
            Página: <span className="text-neutral-200 font-bold">{page}/{totalPages}</span>
          </span>
        </div>
      </div>

      {/* Filtros */}
      <form
        action="/admin/pedidos"
        method="GET"
        className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-950/55 p-4"
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-400">
              Buscar (ID / cliente / email / nota)
            </label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Ej: cmkm..., Emilio, gmail, etc."
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-400">
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

          <div>
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-400">
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

          <div>
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-400">
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-extrabold tracking-wide text-neutral-400">
                Desde
              </label>
              <input
                type="date"
                name="from"
                defaultValue={fromDefault}
                className="mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold tracking-wide text-neutral-400">
                Hasta
              </label>
              <input
                type="date"
                name="to"
                defaultValue={toDefault}
                className="mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-extrabold tracking-wide text-neutral-400">
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

            <div>
              <label className="block text-[11px] font-extrabold tracking-wide text-neutral-400">
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
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-extrabold text-black hover:bg-lime-300"
          >
            Aplicar filtros
          </button>

          <Link
            href="/admin/pedidos"
            className="rounded-xl border border-neutral-800 bg-black/20 px-4 py-2 text-sm font-extrabold text-neutral-200 hover:bg-black/30"
          >
            Limpiar
          </Link>
        </div>
      </form>

      {/* Tabla */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-6 text-neutral-300">
          No hay pedidos para estos filtros.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-950/55">
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-black/25">
              <tr className="border-b border-neutral-800">
                <th className="px-3 py-3 text-left font-extrabold text-neutral-200">Fecha</th>
                <th className="px-3 py-3 text-left font-extrabold text-neutral-200">ID</th>
                <th className="px-3 py-3 text-left font-extrabold text-neutral-200">Cliente</th>
                <th className="px-3 py-3 text-left font-extrabold text-neutral-200">Contacto</th>
                <th className="px-3 py-3 text-left font-extrabold text-neutral-200">Pago</th>
                <th className="px-3 py-3 text-left font-extrabold text-neutral-200">Envío</th>
                <th className="px-3 py-3 text-right font-extrabold text-neutral-200">Total</th>
                <th className="px-3 py-3 text-left font-extrabold text-neutral-200">Estado</th>
                <th className="px-3 py-3 text-left font-extrabold text-neutral-200">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-neutral-900 hover:bg-black/15">
                  <td className="px-3 py-3 align-top text-neutral-200">
                    {new Date(o.createdAt).toLocaleString("es-CL")}
                  </td>

                  <td className="px-3 py-3 align-top font-mono text-[11px] text-neutral-400">
                    {o.id}
                  </td>

                  <td className="px-3 py-3 align-top">
                    <div className="font-bold text-neutral-100">
                      {o.contactName || "—"}
                    </div>
                    {o.notes ? (
                      <div className="mt-1 line-clamp-2 text-[11px] text-neutral-500">
                        {o.notes}
                      </div>
                    ) : null}
                  </td>

                  <td className="px-3 py-3 align-top text-[12px]">
                    <div className="text-neutral-200">{o.contactEmail || "—"}</div>
                    {o.contactPhone ? (
                      <div className="text-neutral-500">{o.contactPhone}</div>
                    ) : null}
                  </td>

                  <td className="px-3 py-3 align-top">
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-extrabold",
                        chipClass("payment", o.paymentMethod),
                      ].join(" ")}
                    >
                      {PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}
                    </span>
                  </td>

                  <td className="px-3 py-3 align-top">
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-extrabold",
                        chipClass("shipping", o.shippingMethod),
                      ].join(" ")}
                    >
                      {SHIPPING_LABELS[o.shippingMethod] ?? o.shippingMethod}
                    </span>
                  </td>

                  <td className="px-3 py-3 align-top text-right font-extrabold text-neutral-100">
                    {CLP(o.total)}
                  </td>

                  <td className="px-3 py-3 align-top">
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-extrabold",
                        chipClass("status", o.status),
                      ].join(" ")}
                    >
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </td>

                  <td className="px-3 py-3 align-top">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="text-lime-300 font-extrabold hover:underline"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 px-4 py-3">
            <div className="text-xs text-neutral-400">
              Mostrando{" "}
              <span className="text-neutral-200 font-bold">
                {Math.min(skip + 1, totalCount)}–{Math.min(skip + orders.length, totalCount)}
              </span>{" "}
              de <span className="text-neutral-200 font-bold">{totalCount}</span>
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

              <span className="rounded-xl border border-neutral-800 bg-black/20 px-3 py-2 text-xs font-extrabold text-neutral-200">
                {page}/{totalPages}
              </span>

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
