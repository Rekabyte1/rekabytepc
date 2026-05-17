import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

function marginAmount(price: number, cost: number) {
  if (!price || !cost) return 0;
  return price - cost;
}

function marginPercent(price: number, cost: number) {
  if (!price || !cost) return null;
  return ((price - cost) / price) * 100;
}

function percentLabel(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}%`;
}

function statusTone(status: string) {
  switch (status) {
    case "OK":
      return "border-lime-400/40 bg-lime-400/10 text-lime-200";
    case "SIN FICHA":
      return "border-amber-400/40 bg-amber-400/10 text-amber-200";
    case "SIN COSTO":
      return "border-sky-400/40 bg-sky-400/10 text-sky-200";
    case "MARGEN BAJO":
      return "border-red-400/40 bg-red-400/10 text-red-200";
    default:
      return "border-neutral-700 bg-black/25 text-neutral-300";
  }
}

function getInventoryStatus(hasInventory: boolean, cost: number, marginTransfer: number | null) {
  if (!hasInventory) return "SIN FICHA";
  if (!cost) return "SIN COSTO";
  if (marginTransfer !== null && marginTransfer < 20) return "MARGEN BAJO";
  return "OK";
}

export default async function AdminInventarioPage() {
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
      stock: true,
      isActive: true,
      priceTransfer: true,
      priceCard: true,
      inventoryItems: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          id: true,
          internalSku: true,
          minStock: true,
          targetStock: true,
          lastNetCost: true,
          lastTaxRate: true,
          lastCostWithTax: true,
          notes: true,
          purchases: {
            orderBy: { purchaseDate: "desc" },
            take: 1,
            select: {
              purchaseDate: true,
              quantity: true,
              unitNetCost: true,
              unitCostWithTax: true,
              totalCost: true,
              supplier: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const rows = products.map((product) => {
    const inventory = product.inventoryItems[0] ?? null;
    const lastPurchase = inventory?.purchases[0] ?? null;

    const stock = product.stock ?? 0;
    const cost = inventory?.lastCostWithTax ?? 0;
    const transferPrice = product.priceTransfer ?? 0;
    const cardPrice = product.priceCard ?? 0;

    const capital = stock * cost;
    const transferMargin = marginPercent(transferPrice, cost);
    const cardMargin = marginPercent(cardPrice, cost);
    const status = getInventoryStatus(Boolean(inventory), cost, transferMargin);

    return {
      product,
      inventory,
      lastPurchase,
      stock,
      cost,
      capital,
      transferMargin,
      cardMargin,
      status,
      transferMarginAmount: marginAmount(transferPrice, cost),
      cardMarginAmount: marginAmount(cardPrice, cost),
    };
  });

  const totalProducts = rows.length;
  const productsWithInventory = rows.filter((row) => row.inventory).length;
  const productsWithoutInventory = rows.filter((row) => !row.inventory).length;
  const totalCapital = rows.reduce((acc, row) => acc + row.capital, 0);
  const lowMargin = rows.filter((row) => row.status === "MARGEN BAJO").length;
  const withoutCost = rows.filter((row) => row.status === "SIN COSTO").length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-100">
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/60 p-5 md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_260px_at_5%_0%,rgba(163,230,53,0.13),transparent_60%)]" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-lime-300">
              Inventario interno
            </p>
            <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">
              Costos, márgenes y capital
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
              Vista read-only. Product en Supabase manda: nombre, SKU, stock, categoría y precios.
              Inventario solo complementa con costos, proveedor y fecha de compra.
            </p>
          </div>

          <Link
            href="/admin/productos"
            className="inline-flex w-fit items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10 px-5 py-3 text-sm font-black text-lime-200 hover:bg-lime-400/15"
          >
            Ver productos
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Productos BD" value={totalProducts} hint="Fuente principal" tone="text-white" />
        <KpiCard label="Con ficha interna" value={productsWithInventory} hint="Costos cargados" tone="text-lime-200" />
        <KpiCard label="Sin ficha" value={productsWithoutInventory} hint="Falta costo/proveedor" tone="text-amber-200" />
        <KpiCard label="Capital inmovilizado" value={CLP(totalCapital)} hint="Stock tienda * costo interno" tone="text-lime-300" />
        <KpiCard label="Margen bajo" value={lowMargin} hint="Transferencia bajo 20%" tone="text-red-200" />
        <KpiCard label="Sin costo" value={withoutCost} hint="Ficha sin costo útil" tone="text-sky-200" />
      </section>

      <section className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-950/60">
        <div className="flex flex-col gap-2 border-b border-neutral-800 p-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
              Matriz inventario
            </p>
            <h2 className="mt-2 text-xl font-black text-white">
              Productos cruzados con costos internos
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Esta tabla no reemplaza Product. Solo muestra costos y compras cuando existe ficha interna.
            </p>
          </div>

          <p className="text-xs text-neutral-500">
            Solo lectura. No modifica stock, precios ni costos.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-xs">
            <thead className="border-b border-neutral-800 bg-black/20">
              <tr>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Producto BD</th>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Categoría</th>
                <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Stock tienda</th>
                <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Costo c/IVA</th>
                <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Capital</th>
                <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Transfer</th>
                <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Margen transfer</th>
                <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Tarjeta</th>
                <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Margen tarjeta</th>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Proveedor</th>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Última compra</th>
                <th className="px-4 py-3 text-left font-extrabold text-neutral-300">Estado</th>
                <th className="px-4 py-3 text-right font-extrabold text-neutral-300">Ver</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.product.id} className="border-t border-neutral-900 hover:bg-white/[0.03]">
                  <td className="min-w-[300px] px-4 py-3">
                    <div className="font-bold text-neutral-100">{row.product.name}</div>
                    <div className="mt-1 text-[11px] text-neutral-500">
                      SKU BD: {row.product.sku ?? "—"}
                      {row.inventory?.internalSku ? ` · SKU interno: ${row.inventory.internalSku}` : ""}
                    </div>
                    <div className="mt-1 text-[11px] text-neutral-600">
                      {row.product.brand ?? "Sin marca"} · {row.product.isActive ? "Activo" : "Inactivo"}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-neutral-300">
                    <div>{CATEGORY_LABELS[row.product.category] ?? row.product.category}</div>
                    {row.product.subcategory ? (
                      <div className="mt-1 text-[11px] text-neutral-500">
                        {row.product.subcategory}
                      </div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                    {row.stock}
                  </td>

                  <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                    {row.cost ? CLP(row.cost) : "—"}
                  </td>

                  <td className="px-4 py-3 text-right font-extrabold text-lime-200">
                    {row.capital ? CLP(row.capital) : "—"}
                  </td>

                  <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                    {CLP(row.product.priceTransfer)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="font-extrabold text-neutral-100">
                      {percentLabel(row.transferMargin)}
                    </div>
                    <div className="mt-1 text-[11px] text-neutral-500">
                      {row.transferMarginAmount ? CLP(row.transferMarginAmount) : "—"}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right font-extrabold text-neutral-100">
                    {CLP(row.product.priceCard)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="font-extrabold text-neutral-100">
                      {percentLabel(row.cardMargin)}
                    </div>
                    <div className="mt-1 text-[11px] text-neutral-500">
                      {row.cardMarginAmount ? CLP(row.cardMarginAmount) : "—"}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-neutral-300">
                    {row.lastPurchase?.supplier.name ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-neutral-300">
                    <div>{dateLabel(row.lastPurchase?.purchaseDate)}</div>
                    {row.lastPurchase?.quantity ? (
                      <div className="mt-1 text-[11px] text-neutral-500">
                        Cantidad: {row.lastPurchase.quantity}
                      </div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3">
                    <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/producto/${row.product.slug}`}
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
    <span
      className={[
        "inline-flex rounded-full border px-2 py-1 text-[11px] font-extrabold",
        tone,
      ].join(" ")}
    >
      {children}
    </span>
  );
}