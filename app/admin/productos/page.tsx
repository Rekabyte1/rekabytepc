import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

type SearchParams = {
  q?: string;
  signal?: string;
  category?: string;
  status?: string;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category: string;
  subcategory: string | null;
  brand: string | null;
  isActive: boolean;
  stock: number | null;
  price: number;
  priceCard: number;
  priceTransfer: number;
  quantitySold: number;
  ordersCount: number;
  revenue: number;
  lastSale: Date | null;
  daysWithoutSale: number | null;
  signal: string;
  suggestion: string;
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

function daysLabel(days: number | null) {
  if (days === null) return "—";
  return `${days} día${days === 1 ? "" : "s"}`;
}

function getEffectivePrice(product: {
  price: number;
  priceTransfer: number;
  priceCard: number;
}) {
  if (product.priceTransfer > 0) return product.priceTransfer;
  if (product.price > 0) return product.price;
  if (product.priceCard > 0) return product.priceCard;
  return 0;
}

function getSignal(product: {
  isActive: boolean;
  stock: number | null;
  quantitySold: number;
  ordersCount: number;
  revenue: number;
  daysWithoutSale: number | null;
  price: number;
}) {
  if (!product.isActive) return "INACTIVO";
  if (product.stock === 0) return "SIN STOCK";
  if (product.quantitySold === 0) return "SIN VENTAS";
  if (product.quantitySold >= 5 || product.ordersCount >= 4) return "HOT";
  if (product.revenue >= 250000) return "ESTRELLA";
  if (product.price > 0 && product.price <= 25000 && product.quantitySold > 0) return "ENGANCHE";
  if (product.daysWithoutSale !== null && product.daysWithoutSale >= 30) return "BAJA ROTACIÓN";
  return "NORMAL";
}

function getSuggestion(product: {
  signal: string;
  isActive: boolean;
  stock: number | null;
  quantitySold: number;
  daysWithoutSale: number | null;
}) {
  if (!product.isActive) return "Producto oculto/inactivo. No priorizar en operación diaria.";
  if (product.stock === 0) return "Sin stock. Revisar reposición solo si tiene señal comercial.";
  if (product.signal === "HOT") return "Destacar en home, reels, historias y campañas.";
  if (product.signal === "ESTRELLA") return "Mantener visible y revisar margen antes de reponer.";
  if (product.signal === "ENGANCHE") return "Usar como producto de entrada, bundle o campaña.";
  if (product.signal === "BAJA ROTACIÓN") return "Revisar precio, imagen, ficha o promoción.";
  if (product.quantitySold === 0) return "Revisar visibilidad, precio, ficha y contenido.";
  if (product.daysWithoutSale !== null && product.daysWithoutSale >= 14) {
    return "Tiene ventas, pero lleva tiempo sin rotar. Reforzar exposición.";
  }
  return "Producto normal. Seguir monitoreando.";
}

function signalTone(signal: string) {
  switch (signal) {
    case "HOT":
      return "border-lime-400/40 bg-lime-400/10 text-lime-200";
    case "ESTRELLA":
      return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
    case "ENGANCHE":
      return "border-sky-400/40 bg-sky-400/10 text-sky-200";
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

function buildHref(params: SearchParams) {
  const sp = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const clean = String(value ?? "").trim();
    if (clean) sp.set(key, clean);
  });

  const query = sp.toString();
  return query ? `/admin/productos?${query}` : "/admin/productos";
}

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = (sp.q ?? "").trim().toLowerCase();
  const signal = (sp.signal ?? "").trim();
  const category = (sp.category ?? "").trim();
  const status = (sp.status ?? "").trim();

  const products = await prisma.product.findMany({
    orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      category: true,
      subcategory: true,
      brand: true,
      isActive: true,
      stock: true,
      price: true,
      priceCard: true,
      priceTransfer: true,
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

  const rows: ProductRow[] = products.map((product) => {
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

    const effectivePrice = getEffectivePrice(product);

    const base = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      isActive: product.isActive,
      stock: product.stock,
      price: effectivePrice,
      priceCard: product.priceCard,
      priceTransfer: product.priceTransfer,
      quantitySold,
      ordersCount: uniqueOrders.size,
      revenue,
      lastSale,
      daysWithoutSale,
      signal: "",
      suggestion: "",
    };

    const rowSignal = getSignal(base);
    const suggestion = getSuggestion({ ...base, signal: rowSignal });

    return {
      ...base,
      signal: rowSignal,
      suggestion,
    };
  });

  const filteredRows = rows.filter((row) => {
    if (q) {
      const haystack = [row.name, row.sku, row.brand, row.subcategory, row.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    if (signal && row.signal !== signal) return false;
    if (category && row.category !== category) return false;

    if (status === "active" && !row.isActive) return false;
    if (status === "inactive" && row.isActive) return false;

    return true;
  });

  const totalProducts = rows.length;
  const activeProducts = rows.filter((row) => row.isActive).length;
  const withoutSales = rows.filter((row) => row.isActive && row.quantitySold === 0).length;
  const withoutStock = rows.filter((row) => row.isActive && row.stock === 0).length;
  const hotProducts = rows.filter((row) => row.signal === "HOT" || row.signal === "ESTRELLA").length;
  const lowRotation = rows.filter((row) => row.signal === "BAJA ROTACIÓN").length;

  const uniqueCategories = Array.from(new Set(rows.map((row) => row.category))).sort();

  const signalOptions = [
    "HOT",
    "ESTRELLA",
    "ENGANCHE",
    "SIN VENTAS",
    "BAJA ROTACIÓN",
    "SIN STOCK",
    "INACTIVO",
    "NORMAL",
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-100">
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/60 p-5 md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_260px_at_5%_0%,rgba(163,230,53,0.13),transparent_60%)]" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-lime-300">
              Catálogo operativo
            </p>
            <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">
              Productos
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
              Vista read-only para revisar stock, precios, rotación, señales comerciales y
              oportunidades del catálogo sin modificar datos sensibles.
            </p>
          </div>

          <Link
            href="/admin/reportes"
            className="inline-flex w-fit items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10 px-5 py-3 text-sm font-black text-lime-200 hover:bg-lime-400/15"
          >
            Ver reportes
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Productos" value={totalProducts} hint="Total en catálogo" tone="text-white" />
        <KpiCard label="Activos" value={activeProducts} hint="Visibles/operativos" tone="text-lime-200" />
        <KpiCard label="Sin ventas" value={withoutSales} hint="Activos nunca vendidos" tone="text-red-200" />
        <KpiCard label="Sin stock" value={withoutStock} hint="Activos con stock 0" tone="text-fuchsia-200" />
        <KpiCard label="Fuertes" value={hotProducts} hint="HOT o estrella" tone="text-emerald-200" />
        <KpiCard label="Baja rotación" value={lowRotation} hint="Vendidos, pero lentos" tone="text-amber-200" />
      </section>

      <form
        action="/admin/productos"
        method="GET"
        className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-950/60 p-4 md:p-5"
      >
        <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-500">
          Filtros operativos
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[240px] flex-1">
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-500">
              Buscar
            </label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Nombre, SKU, marca, subcategoría…"
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-lime-400/40"
            />
          </div>

          <div className="min-w-[180px]">
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-500">
              Señal
            </label>
            <select
              name="signal"
              defaultValue={signal}
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40"
            >
              <option value="">Todas</option>
              {signalOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[190px]">
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-500">
              Categoría
            </label>
            <select
              name="category"
              defaultValue={category}
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40"
            >
              <option value="">Todas</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat] ?? cat}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-[11px] font-extrabold tracking-wide text-neutral-500">
              Estado
            </label>
            <select
              name="status"
              defaultValue={status}
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40"
            >
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <button
            type="submit"
            className="h-[42px] rounded-xl bg-lime-400 px-4 text-sm font-extrabold text-black hover:bg-lime-300"
          >
            Aplicar
          </button>

          <Link
            href="/admin/productos"
            className="inline-flex h-[42px] items-center rounded-xl border border-neutral-800 bg-black/20 px-4 text-sm font-extrabold text-neutral-200 hover:bg-black/30"
          >
            Limpiar
          </Link>
        </div>
      </form>

      <section className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-950/60">
        <div className="flex flex-col gap-2 border-b border-neutral-800 p-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
              Matriz de catálogo
            </p>
            <h2 className="mt-2 text-xl font-black text-white">
              Productos operativos
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Mostrando {filteredRows.length} de {rows.length} productos.
            </p>
          </div>

          <p className="text-xs text-neutral-500">
            Solo lectura. No modifica stock, precios ni estado de publicación.
          </p>
        </div>

        {filteredRows.length === 0 ? (
          <div className="p-6 text-sm text-neutral-400">
            No hay productos para los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead className="border-b border-neutral-800 bg-black/20">
                <tr>
                  <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Producto</th>
                  <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Categoría</th>
                  <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Stock</th>
                  <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Transfer</th>
                  <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Tarjeta</th>
                  <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Vendidos</th>
                  <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Ingreso</th>
                  <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Última venta</th>
                  <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Días sin vender</th>
                  <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Señal</th>
                  <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Sugerencia</th>
                  <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Ver</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-t border-neutral-900 hover:bg-white/[0.03]">
                    <td className="min-w-[280px] px-4 py-3">
                      <div className="font-bold text-neutral-100">{row.name}</div>
                      <div className="mt-1 text-[11px] text-neutral-500">
                        {row.sku ?? "Sin SKU"}
                        {row.brand ? ` · ${row.brand}` : ""}
                      </div>
                      <div className="mt-1">
                        <span
                          className={[
                            "inline-flex rounded-full border px-2 py-1 text-[10px] font-extrabold",
                            row.isActive
                              ? "border-lime-400/30 bg-lime-400/10 text-lime-200"
                              : "border-neutral-700 bg-black/25 text-neutral-500",
                          ].join(" ")}
                        >
                          {row.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-neutral-300">
                      <div>{CATEGORY_LABELS[row.category] ?? row.category}</div>
                      {row.subcategory ? (
                        <div className="mt-1 text-[11px] text-neutral-500">{row.subcategory}</div>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                      {row.stock === null ? "—" : row.stock}
                    </td>

                    <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                      {CLP(row.priceTransfer)}
                    </td>

                    <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                      {CLP(row.priceCard)}
                    </td>

                    <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                      {row.quantitySold}
                    </td>

                    <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                      {CLP(row.revenue)}
                    </td>

                    <td className="px-4 py-3 text-neutral-300">{dateLabel(row.lastSale)}</td>

                    <td className="px-4 py-3 text-neutral-300">{daysLabel(row.daysWithoutSale)}</td>

                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex rounded-full border px-2 py-1 text-[11px] font-extrabold",
                          signalTone(row.signal),
                        ].join(" ")}
                      >
                        {row.signal}
                      </span>
                    </td>

                    <td className="min-w-[260px] px-4 py-3 text-neutral-400">
                      {row.suggestion}
                    </td>

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