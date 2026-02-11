"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../components/CartContext";

export default function CarritoPage() {
  const { items, setQty, removeItem, clear } = useCart();
  const router = useRouter();

  // normalizamos items para TypeScript
  const safeItems = (Array.isArray(items) ? (items as any[]) : []) as any[];

  // total calculado localmente, usando priceTransfer si existe
  const total = safeItems.reduce((acc: number, it: any) => {
    const price =
      typeof it?.priceTransfer === "number"
        ? it.priceTransfer
        : Number(it?.price ?? 0); // fallback antiguo
    const qty = Number(it?.quantity ?? it?.qty ?? 0) || 0;
    return acc + price * qty;
  }, 0);

  const formatCLP = (n: number) =>
    n.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tu carrito</h1>

      {safeItems.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {safeItems.map((it: any) => (
              <li
                key={it.id}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div>
                  <div className="font-semibold">
                    {it.title ?? it.name ?? "Producto"}
                  </div>
                  <div className="text-sm opacity-70">
                    {formatCLP(
                      typeof it?.priceTransfer === "number"
                        ? it.priceTransfer
                        : Number(it?.price ?? 0)
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-16 border rounded p-1"
                    value={Number(it?.quantity ?? it?.qty ?? 1)}
                    min={1}
                    onChange={(e) =>
                      setQty(
                        it.id,
                        Math.max(1, Number(e.target.value) || 1)
                      )
                    }
                  />
                  <button
                    className="text-red-600"
                    onClick={() => removeItem(it.id)}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Totales + botones */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-3">
              {/* NUEVO: Seguir comprando (mismo estilo que Vaciar) */}
              <button
                type="button"
                className="border px-3 py-2 rounded"
                onClick={() => router.push("/")}
              >
                Seguir comprando
              </button>

              <button
                type="button"
                className="border px-3 py-2 rounded"
                onClick={clear}
              >
                Vaciar carrito
              </button>
            </div>

            <div className="text-xl font-bold">
              Total: {formatCLP(total)}
            </div>
          </div>

          <div className="mt-6">
            <Link href="/checkout">
              <button className="bg-lime-400 text-black px-4 py-2 rounded">
                Ir al pago
              </button>
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
