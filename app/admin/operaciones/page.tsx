import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminOperationsProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category: string;
  isActive: boolean;
  stock: number | null;
  orderItems: Array<{
    quantity: number;
    unitPrice: number;
    orderId: string;
    order: {
      status: string;
      createdAt: Date;
    };
  }>;
};

const SOLD_STATUSES = ["PAID", "PREPARING", "SHIPPED", "DELIVERED", "COMPLETED"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  PREBUILT_PC: "PCs armados",
  CPU: "Procesadores",
  MOTHERBOARD: "Placas madre",
  GPU: "Tarjetas de video",
  RAM: "Memorias RAM",
  STORAGE: "Almacenamiento",
  CASE: "Gabinetes",
  PSU: "Fuentes de poder",
  CPU_COOLER: "Coolers CPU",
  CASE_FAN: "Ventiladores",
  THERMAL_PASTE: "Pasta térmica",
  CABLE: "Cables",
  MONITOR: "Monitores",
  PERIPHERAL: "Periféricos",
  ACCESSORY: "Accesorios",
  STREAMING: "Streaming",
  OTHER: "Otros",
};

type ProductOp = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category: string;
  isActive: boolean;
  stock: number | null;
  quantitySold: number;
  ordersCount: number;
  revenue: number;
  lastSale: Date | null;
  daysWithoutSale: number | null;
  signal: string;
  priority: "CRÍTICA" | "ALTA" | "MEDIA" | "BAJA";
  action: string;
};

function CLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function dateLabel(date?: Date | null) {
  if (!date) return "Sin ventas";
  return new Date(date).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getSignal(product: {
  isActive: boolean;
  stock: number | null;
  quantitySold: number;
  ordersCount: number;
  revenue: number;
  daysWithoutSale: number | null;
}) {
  if (!product.isActive) return "INACTIVO";
  if (product.stock === 0) return "SIN STOCK";
  if (product.quantitySold === 0) return "SIN VENTAS";
  if (product.quantitySold >= 5 || product.ordersCount >= 4) return "HOT";
  if (product.revenue >= 250000) return "ESTRELLA";
  if (product.daysWithoutSale !== null && product.daysWithoutSale >= 30) return "BAJA ROTACIÓN";
  return "NORMAL";
}

function getOperationalPriority(product: {
  isActive: boolean;
  stock: number | null;
  quantitySold: number;
  ordersCount: number;
  signal: string;
  daysWithoutSale: number | null;
}) {
  if (!product.isActive) {
    return {
      priority: "BAJA" as const,
      action: "No priorizar. Producto inactivo.",
    };
  }

  if (product.stock === 0 && product.quantitySold > 0) {
    return {
      priority: "CRÍTICA" as const,
      action: "Revisar reposición. Producto vendido quedó sin stock.",
    };
  }

  if ((product.signal === "HOT" || product.signal === "ESTRELLA") && (product.stock ?? 0) <= 2) {
    return {
      priority: "CRÍTICA" as const,
      action: "Riesgo de quiebre. Reponer antes de seguir empujando ventas.",
    };
  }

  if ((product.stock ?? 0) <= 1 && product.isActive) {
    return {
      priority: "ALTA" as const,
      action: "Stock muy bajo. Revisar si conviene reponer o pausar exposición.",
    };
  }

  if (product.signal === "HOT" || product.signal === "ESTRELLA") {
    return {
      priority: "ALTA" as const,
      action: "Producto con buena señal. Destacar en home, reels o campañas.",
    };
  }

  if (product.signal === "SIN VENTAS") {
    return {
      priority: "MEDIA" as const,
      action: "Revisar ficha, precio, imagen y contenido. Dar exposición antes de descartar.",
    };
  }

  if (product.signal === "BAJA ROTACIÓN") {
    return {
      priority: "MEDIA" as const,
      action: "Revisar precio o promoción. Evitar recomprar hasta validar demanda.",
    };
  }

  return {
    priority: "BAJA" as const,
    action: "Monitorear normalmente.",
  };
}

function priorityTone(priority: string) {
  switch (priority) {
    case "CRÍTICA":
      return "border-red-400/40 bg-red-400/10 text-red-200";
    case "ALTA":
      return "border-amber-400/40 bg-amber-400/10 text-amber-200";
    case "MEDIA":
      return "border-sky-400/40 bg-sky-400/10 text-sky-200";
    default:
      return "border-neutral-700 bg-black/25 text-neutral-300";
  }
}

function signalTone(signal: string) {
  switch (signal) {
    case "HOT":
      return "border-lime-400/40 bg-lime-400/10 text-lime-200";
    case "ESTRELLA":
      return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
    case "BAJA ROTACIÓN":
      return "border-amber-400/40 bg-amber-400/10 text-amber-200";
    case "SIN VENTAS":
      return "border-red-400/35 bg-red-400/10 text-red-200";
    case "SIN STOCK":
      return "border-fuchsia-400/35 bg-fuchsia-400/10 text-fuchsia-200";
    case "INACTIVO":
      return "border-neutral-700 bg-black/25 text-neutral-400";
    default:
      return "border-neutral-700 bg-black/25 text-neutral-300";
  }
}

export default async function AdminOperacionesPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      category: true,
      isActive: true,
      stock: true,
      orderItems: {
        select: {
          quantity: true,
          unitPrice: true,
          orderId: true,
          order: {
            select: {
              status: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  const rows: ProductOp[] = products.map((product: AdminOperationsProduct) => {
    const soldItems = product.orderItems.filter((item) =>
      SOLD_STATUSES.includes(item.order.status as (typeof SOLD_STATUSES)[number])
    );

    const uniqueOrders = new Set(soldItems.map((item) => item.orderId));
    const quantitySold = soldItems.reduce((acc, item) => acc + item.quantity, 0);
    const revenue = soldItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

    const saleDates = soldItems
      .map((item) => new Date(item.order.createdAt))
      .sort((a, b) => a.getTime() - b.getTime());

    const lastSale = saleDates[saleDates.length - 1] ?? null;

    const daysWithoutSale =
      lastSale === null
        ? null
        : Math.max(0, Math.floor((Date.now() - lastSale.getTime()) / (1000 * 60 * 60 * 24)));

    const base = {
      isActive: product.isActive,
      stock: product.stock,
      quantitySold,
      ordersCount: uniqueOrders.size,
      revenue,
      daysWithoutSale,
    };

    const signal = getSignal(base);
    const operational = getOperationalPriority({ ...base, signal });

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category: product.category,
      isActive: product.isActive,
      stock: product.stock,
      quantitySold,
      ordersCount: uniqueOrders.size,
      revenue,
      lastSale,
      daysWithoutSale,
      signal,
      priority: operational.priority,
      action: operational.action,
    };
  });

  const critical = rows.filter((row) => row.priority === "CRÍTICA");
  const high = rows.filter((row) => row.priority === "ALTA");
  const lowStock = rows.filter((row) => row.isActive && (row.stock ?? 0) <= 2);
  const noStock = rows.filter((row) => row.isActive && row.stock === 0);
  const hotLowStock = rows.filter(
    (row) => row.isActive && (row.signal === "HOT" || row.signal === "ESTRELLA") && (row.stock ?? 0) <= 2
  );
  const deadProducts = rows.filter((row) => row.isActive && row.signal === "SIN VENTAS");
  const contentCandidates = rows.filter(
    (row) => row.isActive && (row.signal === "SIN VENTAS" || row.signal === "HOT" || row.signal === "ESTRELLA")
  );

  const priorityRows = [...rows]
    .filter((row) => row.priority !== "BAJA")
    .sort((a, b) => {
      const order = { CRÍTICA: 1, ALTA: 2, MEDIA: 3, BAJA: 4 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 15);

  const todayActions = [
    critical.length > 0
      ? `Resolver ${critical.length} alerta(s) crítica(s) de stock o reposición.`
      : "No hay alertas críticas de stock.",
    hotLowStock.length > 0
      ? `Revisar reposición de ${hotLowStock.length} producto(s) fuerte(s) con stock bajo.`
      : "No hay productos fuertes con stock bajo.",
    deadProducts.length > 0
      ? `Dar exposición o revisar ficha/precio de ${deadProducts.length} producto(s) activo(s) sin ventas.`
      : "No hay productos activos sin ventas pendientes.",
    contentCandidates.length > 0
      ? `Elegir ${Math.min(3, contentCandidates.length)} producto(s) para contenido en Instagram/TikTok.`
      : "Sin candidatos claros de contenido por ahora.",
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-100">
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/60 p-5 md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_260px_at_5%_0%,rgba(163,230,53,0.13),transparent_60%)]" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-lime-300">
              Centro de operaciones
            </p>
            <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">
              Alertas y prioridades
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
              Vista read-only para anticipar quiebres de stock, detectar productos que necesitan
              exposición y priorizar acciones comerciales del día.
            </p>
          </div>

          <Link
            href="/admin/productos"
            className="inline-flex w-fit items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10 px-5 py-3 text-sm font-black text-lime-200 hover:bg-lime-400/15"
          >
            Ver catálogo
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Críticas" value={critical.length} hint="Riesgo operativo alto" tone="text-red-200" />
        <KpiCard label="Alta prioridad" value={high.length} hint="Acciones importantes" tone="text-amber-200" />
        <KpiCard label="Stock bajo" value={lowStock.length} hint="Activos con stock <= 2" tone="text-fuchsia-200" />
        <KpiCard label="Sin stock" value={noStock.length} hint="Activos en stock 0" tone="text-red-200" />
        <KpiCard label="Fuertes en riesgo" value={hotLowStock.length} hint="HOT/estrella con poco stock" tone="text-lime-200" />
        <KpiCard label="Sin ventas" value={deadProducts.length} hint="Activos sin ventas" tone="text-sky-200" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-3xl border border-lime-400/20 bg-lime-400/[0.04] p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
            Qué hacer hoy
          </p>
          <h2 className="mt-2 text-xl font-black text-white">Prioridades recomendadas</h2>

          <div className="mt-4 space-y-3">
            {todayActions.map((action) => (
              <div
                key={action}
                className="rounded-2xl border border-neutral-800 bg-black/25 p-4 text-sm leading-6 text-neutral-300"
              >
                {action}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60">
          <div className="border-b border-neutral-800 p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
              Alertas prioritarias
            </p>
            <h2 className="mt-2 text-xl font-black text-white">Productos que requieren acción</h2>
          </div>

          {priorityRows.length === 0 ? (
            <div className="p-6 text-sm text-neutral-400">
              No hay alertas operativas relevantes en este momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead className="border-b border-neutral-800 bg-black/20">
                  <tr>
                    <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Producto</th>
                    <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Stock</th>
                    <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Prioridad</th>
                    <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Señal</th>
                    <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Acción</th>
                    <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Ver</th>
                  </tr>
                </thead>

                <tbody>
                  {priorityRows.map((row) => (
                    <tr key={row.id} className="border-t border-neutral-900 hover:bg-white/[0.03]">
                      <td className="min-w-[260px] px-4 py-3">
                        <div className="font-bold text-neutral-100">{row.name}</div>
                        <div className="mt-1 text-[11px] text-neutral-500">
                          {row.sku ?? "Sin SKU"} · {CATEGORY_LABELS[row.category] ?? row.category}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                        {row.stock === null ? "—" : row.stock}
                      </td>

                      <td className="px-4 py-3">
                        <Badge tone={priorityTone(row.priority)}>{row.priority}</Badge>
                      </td>

                      <td className="px-4 py-3">
                        <Badge tone={signalTone(row.signal)}>{row.signal}</Badge>
                      </td>

                      <td className="min-w-[280px] px-4 py-3 text-neutral-400">{row.action}</td>

                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/producto/${row.slug}`}
                          target="_blank"
                          className="inline-flex rounded-xl border border-lime-400/30 bg-lime-400/10 px-3 py-2 font-extrabold text-lime-200 hover:bg-lime-400/15"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <MiniList
          title="Productos fuertes con stock bajo"
          description="Estos productos deberían revisarse antes de seguir empujándolos."
          rows={hotLowStock}
        />

        <MiniList
          title="Candidatos para contenido"
          description="Productos útiles para reels, historias, publicaciones o bundles."
          rows={contentCandidates.slice(0, 10)}
        />
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

function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={["inline-flex rounded-full border px-2 py-1 text-[11px] font-extrabold", tone].join(" ")}>
      {children}
    </span>
  );
}

function MiniList({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: ProductOp[];
}) {
  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60">
      <div className="border-b border-neutral-800 p-5">
        <h2 className="text-lg font-black text-white">{title}</h2>
        <p className="mt-2 text-sm text-neutral-400">{description}</p>
      </div>

      {rows.length === 0 ? (
        <div className="p-5 text-sm text-neutral-400">Sin productos en esta categoría.</div>
      ) : (
        <div className="divide-y divide-neutral-900">
          {rows.map((row) => (
            <div key={row.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <div className="font-bold text-neutral-100">{row.name}</div>
                <div className="mt-1 text-xs text-neutral-500">
                  Stock: {row.stock ?? "—"} · Vendidos: {row.quantitySold} · Última venta:{" "}
                  {dateLabel(row.lastSale)}
                </div>
              </div>

              <Link
                href={`/producto/${row.slug}`}
                target="_blank"
                className="shrink-0 text-xs font-extrabold text-lime-300 hover:text-lime-200"
              >
                Ver →
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}