import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminReportsProduct = {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  isActive: boolean;
  stock: number | null;
  price: number;
  priceCard: number;
  priceTransfer: number;
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

type AdminPaymentSalesRow = {
  paymentMethod: string;
  _count: { _all: number };
  _sum: { total: number | null };
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

const PAYMENT_LABELS: Record<string, string> = {
  TRANSFER: "Transferencia",
  CARD: "Tarjeta",
};

type ProductInsight = {
  id: string;
  name: string;
  sku: string | null;
  category: string;
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
  firstSale: Date | null;
  salesVelocity: number;
  commercialTag: string;
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

function daysSince(date?: Date | null) {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
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

function getCommercialTag(product: {
  isActive: boolean;
  quantitySold: number;
  ordersCount: number;
  revenue: number;
  daysWithoutSale: number | null;
  price: number;
  stock: number | null;
}) {
  if (!product.isActive) return "INACTIVO";
  if (product.quantitySold === 0) return "SIN VENTAS";

  if (product.quantitySold >= 5 || product.ordersCount >= 4) return "HOT";
  if (product.revenue >= 250000) return "ESTRELLA";
  if (product.price > 0 && product.price <= 25000 && product.quantitySold > 0) return "ENGANCHE";
  if (product.daysWithoutSale !== null && product.daysWithoutSale >= 30) return "BAJA ROTACIÓN";
  if (product.stock === 0) return "SIN STOCK";

  return "NORMAL";
}

function getSuggestion(product: {
  isActive: boolean;
  quantitySold: number;
  commercialTag: string;
  daysWithoutSale: number | null;
  stock: number | null;
}) {
  if (!product.isActive) {
    return "Producto inactivo. Mantener fuera del análisis operativo principal.";
  }

  if (product.stock === 0) {
    return "Sin stock. Revisar reposición solo si tuvo ventas o cumple rol estratégico.";
  }

  if (product.commercialTag === "HOT") {
    return "Producto con buena señal comercial. Considerar destacarlo en home, redes y campañas.";
  }

  if (product.commercialTag === "ESTRELLA") {
    return "Producto relevante por ingreso. Revisar margen y mantenerlo visible.";
  }

  if (product.commercialTag === "ENGANCHE") {
    return "Buen candidato para atraer primeras compras, bundles o campañas de entrada.";
  }

  if (product.commercialTag === "BAJA ROTACIÓN") {
    return "Revisar precio, imagen, copy o considerar promoción antes de reponer.";
  }

  if (product.quantitySold === 0) {
    return "Sin ventas confirmadas. Revisar visibilidad, precio, ficha e impulso en contenido.";
  }

  if (product.daysWithoutSale !== null && product.daysWithoutSale >= 14) {
    return "Tiene ventas, pero lleva tiempo sin rotar. Reforzar exposición o revisar precio.";
  }

  return "Comportamiento normal. Seguir monitoreando con más volumen de ventas.";
}

function tagTone(tag: string) {
  switch (tag) {
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

export default async function AdminReportesPage() {
  const [products, paymentSales, confirmedOrdersSummary] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
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
    }),

    prisma.order.groupBy({
      by: ["paymentMethod"],
      where: {
        status: {
          in: [...SOLD_STATUSES],
        },
      },
      _count: {
        _all: true,
      },
      _sum: {
        total: true,
      },
    }),

    prisma.order.aggregate({
      where: {
        status: {
          in: [...SOLD_STATUSES],
        },
      },
      _count: {
        _all: true,
      },
      _sum: {
        total: true,
      },
    }),
  ]);

const productStats: ProductInsight[] = products.map((product: AdminReportsProduct) => {    const soldItems = product.orderItems.filter((item) =>
      SOLD_STATUSES.includes(item.order.status as (typeof SOLD_STATUSES)[number])
    );

    const uniqueOrders = new Set(soldItems.map((item) => item.orderId));
    const quantitySold = soldItems.reduce((acc, item) => acc + item.quantity, 0);
    const revenue = soldItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

    const saleDates = soldItems
      .map((item) => new Date(item.order.createdAt))
      .sort((a, b) => a.getTime() - b.getTime());

    const firstSale = saleDates[0] ?? null;
    const lastSale = saleDates[saleDates.length - 1] ?? null;

    const daysWithoutSale =
      lastSale === null
        ? null
        : Math.max(0, Math.floor((Date.now() - lastSale.getTime()) / (1000 * 60 * 60 * 24)));

    const activeDays =
      firstSale === null
        ? 0
        : Math.max(1, Math.floor((Date.now() - firstSale.getTime()) / (1000 * 60 * 60 * 24)));

    const salesVelocity = activeDays > 0 ? quantitySold / activeDays : 0;
    const effectivePrice = getEffectivePrice(product);

    const baseProduct = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
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
      firstSale,
      salesVelocity,
      commercialTag: "",
      suggestion: "",
    };

    const commercialTag = getCommercialTag(baseProduct);
    const suggestion = getSuggestion({ ...baseProduct, commercialTag });

    return {
      ...baseProduct,
      commercialTag,
      suggestion,
    };
  });

  const totalConfirmedOrders = confirmedOrdersSummary._count._all;
  const totalConfirmedRevenue = confirmedOrdersSummary._sum.total ?? 0;
  const averageTicket =
    totalConfirmedOrders > 0 ? Math.round(totalConfirmedRevenue / totalConfirmedOrders) : 0;
  const totalUnitsSold = productStats.reduce((acc, product) => acc + product.quantitySold, 0);

  const topProducts = [...productStats]
    .filter((p) => p.quantitySold > 0)
    .sort((a, b) => b.quantitySold - a.quantitySold || b.revenue - a.revenue)
    .slice(0, 5);

  const starProducts = [...productStats]
    .filter((p) => p.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue || b.quantitySold - a.quantitySold)
    .slice(0, 5);

  const hookProducts = [...productStats]
    .filter((p) => p.commercialTag === "ENGANCHE")
    .sort((a, b) => b.quantitySold - a.quantitySold || a.price - b.price)
    .slice(0, 5);

  const deadProducts = [...productStats]
    .filter((p) => p.isActive && p.quantitySold === 0)
    .sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0))
    .slice(0, 10);

  const slowRotationProducts = [...productStats]
    .filter((p) => p.isActive && p.quantitySold > 0 && (p.daysWithoutSale ?? 0) >= 14)
    .sort((a, b) => (b.daysWithoutSale ?? 0) - (a.daysWithoutSale ?? 0))
    .slice(0, 10);

  const categoryMap = new Map<string, { quantity: number; revenue: number; products: number }>();

  for (const product of productStats) {
    const current = categoryMap.get(product.category) ?? { quantity: 0, revenue: 0, products: 0 };
    current.quantity += product.quantitySold;
    current.revenue += product.revenue;
    current.products += 1;
    categoryMap.set(product.category, current);
  }

  const salesByCategory = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      ...data,
    }))
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue);

  const insights = [
    {
      label: "Pedidos confirmados",
      value: totalConfirmedOrders,
      hint: "Pedidos no cancelados y operativamente confirmados",
      tone: "text-lime-200",
    },
    {
      label: "Ingresos confirmados",
      value: CLP(totalConfirmedRevenue),
      hint: "Total vendido en estados activos",
      tone: "text-lime-300",
    },
    {
      label: "Ticket promedio",
      value: CLP(averageTicket),
      hint: "Ingresos / pedidos confirmados",
      tone: "text-sky-200",
    },
    {
      label: "Unidades vendidas",
      value: totalUnitsSold,
      hint: "Suma de cantidades vendidas",
      tone: "text-white",
    },
    {
      label: "Productos sin ventas",
      value: deadProducts.length,
      hint: "Productos activos nunca vendidos",
      tone: "text-red-200",
    },
    {
      label: "Baja rotación",
      value: slowRotationProducts.length,
      hint: "Vendidos, pero sin rotar hace 14+ días",
      tone: "text-amber-200",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-100">
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/60 p-5 md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_260px_at_5%_0%,rgba(163,230,53,0.13),transparent_60%)]" />
        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-lime-300">
            Reporte Comercial 1.3
          </p>
          <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">
            Inteligencia comercial
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
            Lectura operativa para detectar productos estrella, productos enganche, productos sin
            rotación y categorías fuertes. Esta vista es solo lectura y no modifica datos.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {insights.map((item) => (
          <KpiCard key={item.label} {...item} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <ReportCard title="Productos HOT por unidades">
          {topProducts.length === 0 ? (
            <EmptyState text="Todavía no hay ventas confirmadas. Cuando existan ventas reales, aquí aparecerán los productos con mayor rotación." />
          ) : (
            <Table
              headers={["Producto", "Vendidos", "Pedidos", "Última venta", "Señal"]}
              rows={topProducts.map((p) => [
                p.name,
                String(p.quantitySold),
                String(p.ordersCount),
                dateLabel(p.lastSale),
                p.commercialTag,
              ])}
            />
          )}
        </ReportCard>

        <ReportCard title="Productos estrella por ingreso">
          {starProducts.length === 0 ? (
            <EmptyState text="Sin ingresos confirmados todavía. Esta sección mostrará los productos que más dinero generan." />
          ) : (
            <Table
              headers={["Producto", "Ingreso", "Vendidos", "Ticket aprox.", "Señal"]}
              rows={starProducts.map((p) => [
                p.name,
                CLP(p.revenue),
                String(p.quantitySold),
                p.quantitySold > 0 ? CLP(Math.round(p.revenue / p.quantitySold)) : "—",
                p.commercialTag,
              ])}
            />
          )}
        </ReportCard>

        <ReportCard title="Productos enganche">
          {hookProducts.length === 0 ? (
            <EmptyState text="Aún no hay productos baratos con ventas confirmadas. Esta sección será clave para detectar productos de entrada." />
          ) : (
            <Table
              headers={["Producto", "Precio base", "Vendidos", "Ingreso", "Sugerencia"]}
              rows={hookProducts.map((p) => [
                p.name,
                CLP(p.price),
                String(p.quantitySold),
                CLP(p.revenue),
                "Usar en campañas/bundles",
              ])}
            />
          )}
        </ReportCard>

        <ReportCard title="Ventas por método de pago">
          {paymentSales.length === 0 ? (
            <EmptyState text="No hay ventas confirmadas para agrupar por método de pago." />
          ) : (
            <Table
              headers={["Método", "Pedidos", "Total"]}
              rows={paymentSales.map((row) => [
                PAYMENT_LABELS[row.paymentMethod] ?? row.paymentMethod,
                String(row._count._all),
                CLP(row._sum.total ?? 0),
              ])}
            />
          )}
        </ReportCard>

        <ReportCard title="Categorías fuertes">
          {salesByCategory.length === 0 ? (
            <EmptyState text="No existen productos suficientes para analizar categorías." />
          ) : (
            <Table
              headers={["Categoría", "Productos", "Unidades", "Ingreso"]}
              rows={salesByCategory.map((row) => [
                CATEGORY_LABELS[row.category] ?? row.category,
                String(row.products),
                String(row.quantity),
                CLP(row.revenue),
              ])}
            />
          )}
        </ReportCard>

        <ReportCard title="Productos activos sin ventas">
          {deadProducts.length === 0 ? (
            <EmptyState text="No hay productos activos sin ventas, o todavía no hay catálogo activo suficiente." />
          ) : (
            <Table
              headers={["Producto", "SKU", "Stock", "Precio", "Sugerencia"]}
              rows={deadProducts.map((p) => [
                p.name,
                p.sku ?? "—",
                p.stock === null ? "—" : String(p.stock),
                CLP(p.price),
                "Revisar ficha/precio/contenido",
              ])}
            />
          )}
        </ReportCard>
      </section>

      <section className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-950/60">
        <div className="border-b border-neutral-800 p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
            Matriz comercial
          </p>
          <h2 className="mt-2 text-xl font-black text-white">
            Rotación, días sin vender y sugerencia automática
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Esta tabla es la base para decidir qué publicar, qué destacar, qué reponer y qué dejar
            de comprar.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-xs">
            <thead className="border-b border-neutral-800 bg-black/20">
              <tr>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Producto</th>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Categoría</th>
                <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Stock</th>
                <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Vendidos</th>
                <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Ingreso</th>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Última venta</th>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Días sin vender</th>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Señal</th>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Sugerencia</th>
              </tr>
            </thead>

            <tbody>
              {productStats.map((p) => (
                <tr key={p.id} className="border-t border-neutral-900 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="font-bold text-neutral-100">{p.name}</div>
                    <div className="mt-1 text-[11px] text-neutral-500">{p.sku ?? "Sin SKU"}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-300">
                    {CATEGORY_LABELS[p.category] ?? p.category}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                    {p.stock === null ? "—" : p.stock}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                    {p.quantitySold}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                    {CLP(p.revenue)}
                  </td>
                  <td className="px-4 py-3 text-neutral-300">{dateLabel(p.lastSale)}</td>
                  <td className="px-4 py-3 text-neutral-300">{daysSince(p.lastSale)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex rounded-full border px-2 py-1 text-[11px] font-extrabold",
                        tagTone(p.commercialTag),
                      ].join(" ")}
                    >
                      {p.commercialTag}
                    </span>
                  </td>
                  <td className="min-w-[260px] px-4 py-3 text-neutral-400">{p.suggestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-lime-400/20 bg-lime-400/[0.04] p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
          Lectura estratégica
        </p>
        <h2 className="mt-2 text-xl font-black text-white">Cómo interpretar este reporte</h2>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-neutral-300 md:grid-cols-2">
          <p>
            Los productos <strong className="text-lime-200">HOT</strong> son candidatos para
            destacarse en home, reels, historias y campañas. Los{" "}
            <strong className="text-sky-200">ENGANCHE</strong> sirven para atraer primeras compras
            y armar bundles.
          </p>
          <p>
            Los productos <strong className="text-red-200">SIN VENTAS</strong> o de{" "}
            <strong className="text-amber-200">BAJA ROTACIÓN</strong> deben revisarse antes de
            reponer: precio, imagen, ficha, visibilidad o compatibilidad con el enfoque actual de
            RekaByte.
          </p>
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

function ReportCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-5">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-black/20 p-4 text-sm text-neutral-400">
      {text}
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-800">
      <table className="min-w-full border-collapse text-xs">
        <thead className="border-b border-neutral-800 bg-black/20">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-left font-extrabold text-neutral-300">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-neutral-900">
              {row.map((cell, cellIndex) => (
                <td key={`${index}-${cellIndex}`} className="px-4 py-3 text-neutral-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}