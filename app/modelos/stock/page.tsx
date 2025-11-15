// app/modelos/stock/page.tsx
import ProductCard from "@/components/ProductCard";

// Cargamos los productos de forma tolerante a cómo esté exportado el módulo
function loadProducts(): any[] {
  try {
    const mod = require("@/data/products");
    return (mod.PRODUCTS ?? mod.default ?? []) as any[];
  } catch {
    return [];
  }
}

export default function EnStockPage() {
  const ALL = loadProducts();
  // Si tu data tiene otra bandera (p.ej. status === "stock"), ajusta aquí.
  const ITEMS = ALL.filter((p) => (p?.inStock ?? true) === true);

  return (
    <main className="checkout-page">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-2 text-2xl font-extrabold text-white">En stock</h1>
        <p className="mb-6 text-neutral-300">
          Equipos disponibles para entrega inmediata. Puedes agregarlos al carrito y continuar el checkout.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.length === 0 ? (
            <p className="text-neutral-400">No hay equipos en stock por ahora.</p>
          ) : (
            ITEMS.map((p) => <ProductCard key={p.id} p={p} />)
          )}
        </div>
      </div>
    </main>
  );
}
