import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VALID_ORDER_STATUSES = ["PAID", "PREPARING", "SHIPPED", "DELIVERED", "COMPLETED"] as const;

type SearchParams = {
  q?: string;
  type?: string;
};

type CustomerRow = {
  key: string;
  name: string;
  email: string;
  phone: string | null;
  userId: string | null;
  source: "Cuenta" | "Guest";
  ordersCount: number;
  confirmedOrdersCount: number;
  totalSpent: number;
  averageTicket: number;
  firstOrderAt: Date | null;
  lastOrderAt: Date | null;
  lastOrderId: string | null;
  customerType: "Nuevo" | "Recurrente" | "Sin compras confirmadas";
  suggestion: string;
};

type AdminUserLite = {
  id: string;
  name: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  createdAt: Date;
};

function CLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function dateLabel(date?: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function daysSince(date?: Date | null) {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  return `${days} día${days === 1 ? "" : "s"}`;
}

function normalizeEmail(email: string | null | undefined) {
  return String(email ?? "").trim().toLowerCase();
}

function customerTone(type: string) {
  switch (type) {
    case "Recurrente":
      return "border-lime-400/40 bg-lime-400/10 text-lime-200";
    case "Nuevo":
      return "border-sky-400/40 bg-sky-400/10 text-sky-200";
    default:
      return "border-neutral-700 bg-black/25 text-neutral-400";
  }
}

function sourceTone(source: string) {
  if (source === "Cuenta") return "border-emerald-400/35 bg-emerald-400/10 text-emerald-200";
  return "border-amber-400/35 bg-amber-400/10 text-amber-200";
}

function getSuggestion(customer: {
  confirmedOrdersCount: number;
  totalSpent: number;
  averageTicket: number;
  lastOrderAt: Date | null;
}) {
  if (customer.confirmedOrdersCount === 0) {
    return "Sin compras confirmadas. No priorizar comercialmente todavía.";
  }

  if (customer.confirmedOrdersCount >= 2) {
    return "Cliente recurrente. Buen candidato para remarketing, bundles o beneficios.";
  }

  if (customer.totalSpent >= 250000) {
    return "Cliente de alto valor. Revisar qué compró y considerar seguimiento personalizado.";
  }

  if (customer.averageTicket >= 100000) {
    return "Ticket interesante. Puede responder bien a ofertas de upgrade o accesorios.";
  }

  if (customer.lastOrderAt) {
    const days = Math.floor((Date.now() - customer.lastOrderAt.getTime()) / (1000 * 60 * 60 * 24));
    if (days >= 60) return "Cliente antiguo. Puede servir para campaña de reactivación.";
  }

  return "Cliente nuevo o de baja frecuencia. Seguir monitoreando.";
}

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = (sp.q ?? "").trim().toLowerCase();
  const type = (sp.type ?? "").trim();

  const [orders, users] = await Promise.all([
    prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        userId: true,
        contactEmail: true,
        contactName: true,
        contactPhone: true,
        status: true,
        total: true,
        createdAt: true,
      },
    }),

    prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    }),
  ]);

  const userById = new Map<string, AdminUserLite>(
    users.map((user: AdminUserLite) => [user.id, user])
  );
  const grouped = new Map<string, CustomerRow>();

  for (const order of orders) {
    const email = normalizeEmail(order.contactEmail);
    const user = order.userId ? userById.get(order.userId) : null;
    const key = user?.id ? `user:${user.id}` : `email:${email || order.id}`;

    const isConfirmed = VALID_ORDER_STATUSES.includes(
      order.status as (typeof VALID_ORDER_STATUSES)[number]
    );

    const existing = grouped.get(key);

    if (!existing) {
      const name =
        order.contactName ||
        [user?.name, user?.lastName].filter(Boolean).join(" ") ||
        "Cliente sin nombre";

      grouped.set(key, {
        key,
        name,
        email: email || user?.email || "—",
        phone: order.contactPhone || user?.phone || null,
        userId: user?.id ?? null,
        source: user?.id ? "Cuenta" : "Guest",
        ordersCount: 1,
        confirmedOrdersCount: isConfirmed ? 1 : 0,
        totalSpent: isConfirmed ? order.total : 0,
        averageTicket: isConfirmed ? order.total : 0,
        firstOrderAt: order.createdAt,
        lastOrderAt: order.createdAt,
        lastOrderId: order.id,
        customerType: isConfirmed ? "Nuevo" : "Sin compras confirmadas",
        suggestion: "",
      });

      continue;
    }

    existing.ordersCount += 1;

    if (isConfirmed) {
      existing.confirmedOrdersCount += 1;
      existing.totalSpent += order.total;
      existing.averageTicket =
        existing.confirmedOrdersCount > 0
          ? Math.round(existing.totalSpent / existing.confirmedOrdersCount)
          : 0;
    }

    if (!existing.firstOrderAt || order.createdAt < existing.firstOrderAt) {
      existing.firstOrderAt = order.createdAt;
    }

    if (!existing.lastOrderAt || order.createdAt > existing.lastOrderAt) {
      existing.lastOrderAt = order.createdAt;
      existing.lastOrderId = order.id;
    }

    if (!existing.phone && order.contactPhone) {
      existing.phone = order.contactPhone;
    }

    existing.customerType =
      existing.confirmedOrdersCount >= 2
        ? "Recurrente"
        : existing.confirmedOrdersCount === 1
          ? "Nuevo"
          : "Sin compras confirmadas";
  }

  const rows = Array.from(grouped.values()).map((customer) => ({
    ...customer,
    suggestion: getSuggestion(customer),
  }));

  const filteredRows = rows.filter((row) => {
    if (q) {
      const haystack = [row.name, row.email, row.phone, row.source, row.customerType]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    if (type && row.customerType !== type) return false;

    return true;
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent;
    return (b.lastOrderAt?.getTime() ?? 0) - (a.lastOrderAt?.getTime() ?? 0);
  });

  const totalCustomers = rows.length;
  const registeredCustomers = rows.filter((row) => row.source === "Cuenta").length;
  const guestCustomers = rows.filter((row) => row.source === "Guest").length;
  const recurrentCustomers = rows.filter((row) => row.customerType === "Recurrente").length;
  const totalRevenue = rows.reduce((acc, row) => acc + row.totalSpent, 0);
  const averageCustomerValue =
    totalCustomers > 0 ? Math.round(totalRevenue / Math.max(1, rows.filter((r) => r.totalSpent > 0).length)) : 0;

  const typeOptions = ["Nuevo", "Recurrente", "Sin compras confirmadas"];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-100">
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/60 p-5 md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_260px_at_5%_0%,rgba(163,230,53,0.13),transparent_60%)]" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-lime-300">
              Clientes
            </p>
            <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">
              Inteligencia de clientes
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
              Vista read-only para entender compradores, recurrencia, gasto total, ticket promedio
              y oportunidades comerciales sin exponer ni modificar lógica sensible.
            </p>
          </div>

          <Link
            href="/admin/pedidos"
            className="inline-flex w-fit items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10 px-5 py-3 text-sm font-black text-lime-200 hover:bg-lime-400/15"
          >
            Ver pedidos
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Clientes" value={totalCustomers} hint="Correos/cuentas únicas" tone="text-white" />
        <KpiCard label="Con cuenta" value={registeredCustomers} hint="Usuarios registrados" tone="text-lime-200" />
        <KpiCard label="Guest" value={guestCustomers} hint="Compras sin cuenta" tone="text-amber-200" />
        <KpiCard label="Recurrentes" value={recurrentCustomers} hint="2+ compras confirmadas" tone="text-emerald-200" />
        <KpiCard label="Ingresos clientes" value={CLP(totalRevenue)} hint="Compras confirmadas" tone="text-lime-300" />
        <KpiCard label="Valor promedio" value={CLP(averageCustomerValue)} hint="Promedio por cliente comprador" tone="text-sky-200" />
      </section>

      <form
        action="/admin/clientes"
        method="GET"
        className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-950/60 p-4 md:p-5"
      >
        <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-500">
          Filtros
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[260px] flex-1">
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-500">
              Buscar
            </label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Nombre, correo, teléfono…"
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-lime-400/40"
            />
          </div>

          <div className="min-w-[220px]">
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-500">
              Tipo de cliente
            </label>
            <select
              name="type"
              defaultValue={type}
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40"
            >
              <option value="">Todos</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded-xl border border-lime-400/35 bg-lime-400/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-lime-200 hover:bg-lime-400/15"
          >
            Aplicar
          </button>

          <Link
            href="/admin/clientes"
            className="rounded-xl border border-neutral-700 bg-black/30 px-4 py-2 text-xs font-black uppercase tracking-wide text-neutral-300 hover:border-neutral-500"
          >
            Limpiar
          </Link>
        </div>
      </form>

      <section className="mt-6 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/60">
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full text-left">
            <thead className="bg-black/35 text-[11px] uppercase tracking-wide text-neutral-400">
              <tr>
                <Th>Cliente</Th>
                <Th>Fuente</Th>
                <Th>Estado</Th>
                <Th>Compras conf.</Th>
                <Th>Órdenes</Th>
                <Th>Gasto total</Th>
                <Th>Ticket prom.</Th>
                <Th>Primera compra</Th>
                <Th>Última compra</Th>
                <Th>Inactividad</Th>
                <Th>Sugerencia</Th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr key={row.key} className="border-t border-neutral-800/80 align-top">
                  <Td>
                    <div className="font-semibold text-white">{row.name}</div>
                    <div className="text-xs text-neutral-400">{row.email}</div>
                    <div className="text-xs text-neutral-500">{row.phone || "Sin teléfono"}</div>
                    {row.lastOrderId ? (
                      <Link
                        href={`/admin/pedidos/${row.lastOrderId}`}
                        className="mt-1 inline-block text-[11px] font-bold text-lime-300 hover:text-lime-200"
                      >
                        Último pedido →
                      </Link>
                    ) : null}
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wide ${sourceTone(
                        row.source
                      )}`}
                    >
                      {row.source}
                    </span>
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wide ${customerTone(
                        row.customerType
                      )}`}
                    >
                      {row.customerType}
                    </span>
                  </Td>

                  <Td>{row.confirmedOrdersCount}</Td>
                  <Td>{row.ordersCount}</Td>
                  <Td className="font-semibold text-lime-200">{CLP(row.totalSpent)}</Td>
                  <Td>{row.confirmedOrdersCount > 0 ? CLP(row.averageTicket) : "—"}</Td>
                  <Td>{dateLabel(row.firstOrderAt)}</Td>
                  <Td>{dateLabel(row.lastOrderAt)}</Td>
                  <Td>{daysSince(row.lastOrderAt)}</Td>
                  <Td>
                    <p className="max-w-xs text-xs leading-5 text-neutral-300">{row.suggestion}</p>
                  </Td>
                </tr>
              ))}

              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-sm text-neutral-500">
                    No hay clientes para mostrar con los filtros actuales.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
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
  tone?: string;
}) {
  return (
    <article className="rounded-2xl border border-neutral-800 bg-black/30 p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tone ?? "text-white"}`}>{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{hint}</p>
    </article>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-black">{children}</th>;
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}