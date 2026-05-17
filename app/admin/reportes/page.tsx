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

export default async function AdminReportesPage() {
  const [products, paymentSales] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        isActive: true,
        orderItems: {
          select: {
            quantity: true,
            unitPrice: true,
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
  ]);

  const productStats = products.map((product) => {
    const soldItems = product.orderItems.filter((item) =>
      SOLD_STATUSES.includes(item.order.status as (typeof SOLD_STATUSES)[number])
    );

    const quantitySold = soldItems.reduce((acc, item) => acc + item.quantity, 0);
    const revenue = soldItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

    const lastSale =
      soldItems.length > 0
        ? soldItems.reduce<Date | null>((latest, item) => {
            const current = new Date(item.order.createdAt);
            if (!latest || current > latest) return current;
            return latest;
          }, null)
        : null;

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      isActive: product.isActive,
      quantitySold,
      revenue,
      lastSale,
    };
  });

  const topProducts = [...productStats]
    .filter((p) => p.quantitySold > 0)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);

  const productsWithoutSales = productStats.filter((p) => p.quantitySold === 0);

  const categoryMap = new Map<string, { quantity: number; revenue: number }>();

  for (const product of productStats) {
    const current = categoryMap.get(product.category) ?? { quantity: 0, revenue: 0 };
    current.quantity += product.quantitySold;
    current.revenue += product.revenue;
    categoryMap.set(product.category, current);
  }

  const salesByCategory = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      ...data,
    }))
    .filter((row) => row.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-100">
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/60 p-5 md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_260px_at_5%_0%,rgba(163,230,53,0.13),transparent_60%)]" />
        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-lime-300">
            Reportes
          </p>
          <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">
            Reportes básicos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
            Primera vista read-only para entender productos vendidos, productos sin ventas,
            métodos de pago y categorías. No inventa datos ni cambia reglas de negocio.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <ReportCard title="Top 5 productos más vendidos">
          {topProducts.length === 0 ? (
            <EmptyState text="Todavía no hay productos vendidos en pedidos confirmados." />
          ) : (
            <Table
              headers={["Producto", "Vendido", "Última venta", "Ingreso"]}
              rows={topProducts.map((p) => [
                p.name,
                String(p.quantitySold),
                dateLabel(p.lastSale),
                CLP(p.revenue),
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

        <ReportCard title="Ventas por categoría">
          {salesByCategory.length === 0 ? (
            <EmptyState text="No hay ventas confirmadas suficientes para calcular categorías." />
          ) : (
            <Table
              headers={["Categoría", "Cantidad", "Ingreso"]}
              rows={salesByCategory.map((row) => [
                CATEGORY_LABELS[row.category] ?? row.category,
                String(row.quantity),
                CLP(row.revenue),
              ])}
            />
          )}
        </ReportCard>

        <ReportCard title="Productos sin ventas">
          {productsWithoutSales.length === 0 ? (
            <EmptyState text="Todos los productos registrados tienen al menos una venta confirmada." />
          ) : (
            <Table
              headers={["Producto", "SKU", "Categoría", "Estado"]}
              rows={productsWithoutSales.slice(0, 12).map((p) => [
                p.name,
                p.sku ?? "—",
                CATEGORY_LABELS[p.category] ?? p.category,
                p.isActive ? "Activo" : "Inactivo",
              ])}
            />
          )}

          {productsWithoutSales.length > 12 ? (
            <p className="mt-3 text-xs text-neutral-500">
              Mostrando 12 de {productsWithoutSales.length} productos sin ventas.
            </p>
          ) : null}
        </ReportCard>
      </section>

      <section className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-950/60">
        <div className="border-b border-neutral-800 p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
            Detalle por producto
          </p>
          <h2 className="mt-2 text-xl font-black text-white">
            Cantidad vendida, última venta y días sin vender
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-xs">
            <thead className="border-b border-neutral-800 bg-black/20">
              <tr>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Producto</th>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Categoría</th>
                <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Vendidos</th>
                <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Ingreso</th>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Última venta</th>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Días sin vender</th>
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
                    {p.quantitySold}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                    {CLP(p.revenue)}
                  </td>
                  <td className="px-4 py-3 text-neutral-300">{dateLabel(p.lastSale)}</td>
                  <td className="px-4 py-3 text-neutral-300">{daysSince(p.lastSale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
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