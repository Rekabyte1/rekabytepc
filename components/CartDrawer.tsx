"use client";

import { useRouter } from "next/navigation";
import Portal from "./Portal";
import { useCart, CLP } from "./CartContext";

export default function CartDrawer() {
  const router = useRouter();
  const {
    isOpen,
    toggleCart,
    items,
    clear,
    subtotalTransfer,
    subtotalCard,
    setQty,
    removeItem,
  } = useCart();

  // Ir a la pantalla de opciones de compra
  const handleGoCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/checkout/opciones");
    requestAnimationFrame(() => toggleCart());
  };

  return (
    <Portal>
      {/* Overlay: clic afuera cierra */}
      <div
        className={`rb-overlay ${isOpen ? "open" : ""}`}
        onClick={toggleCart}
      />

      {/* Drawer */}
      <aside
        className={`rb-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Carrito"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="rb-drawer__header">
          <h3 className="font-bold text-lg">Tu carrito</h3>
          <button
            onClick={toggleCart}
            className="rb-drawer__close"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="rb-drawer__content">
          {items.length === 0 ? (
            <p className="text-neutral-400">Tu carrito está vacío.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="rounded-xl border border-neutral-800 p-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Miniatura */}
                    <div className="rb-thumb shrink-0 overflow-hidden rounded-md bg-neutral-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {it.image ? (
                        <img
                          src={it.image}
                          alt={it.name}
                          draggable={false}
                        />
                      ) : (
                        <div style={{ width: 64, height: 64 }} />
                      )}
                    </div>

                    {/* Centro */}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{it.name}</div>

                      {/* precios unitarios */}
                      <div className="mt-1 grid grid-cols-2 gap-x-3 text-xs">
                        <span className="text-neutral-400">
                          Transf.:{" "}
                          <span className="text-neutral-200">
                            {CLP(it.priceTransfer)}
                          </span>
                        </span>
                        <span className="text-neutral-400">
                          Otros:{" "}
                          <span className="text-neutral-200">
                            {CLP(it.priceCard)}
                          </span>
                        </span>
                      </div>

                      {/* cantidad */}
                      <div className="mt-2 inline-flex items-center gap-2 text-sm">
                        <button
                          className="rounded-md border border-neutral-700 px-2"
                          onClick={() => setQty(it.id, it.quantity - 1)}
                          aria-label="Restar"
                        >
                          −
                        </button>
                        <span>{it.quantity}</span>
                        <button
                          className="rounded-md border border-neutral-700 px-2"
                          onClick={() => setQty(it.id, it.quantity + 1)}
                          aria-label="Sumar"
                        >
                          +
                        </button>
                        <button
                          className="ml-3 rounded-md border border-neutral-700 px-2 text-xs text-neutral-400"
                          onClick={() => removeItem(it.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Derecha: totales por ítem */}
                    <div className="text-right text-sm">
                      <div className="font-medium text-neutral-200">
                        {CLP(it.priceTransfer * it.quantity)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {CLP(it.priceCard * it.quantity)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Totales */}
        <div className="border-t border-neutral-800 px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Total Transferencia</span>
            <span className="font-semibold text-lime-400">
              {CLP(subtotalTransfer)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-neutral-400">Total Otros medios</span>
            <span className="font-semibold text-neutral-200">
              {CLP(subtotalCard)}
            </span>
          </div>
        </div>

        {/* Footer acciones */}
        <div className="rb-drawer__footer">
          {/* Seguir comprando = solo cerrar */}
          <button
            className="rb-btn--ghost rb-btn"
            onClick={toggleCart}
          >
            Seguir comprando
          </button>

          {/* Vaciar */}
          <button
            className="rb-btn--ghost rb-btn"
            onClick={clear}
          >
            Vaciar
          </button>

          {/* Ir al pago (nuevo flujo con pantalla de opciones) */}
          <button
            className="rb-btn"
            onClick={handleGoCheckout}
          >
            Ir al pago
          </button>
        </div>
      </aside>
    </Portal>
  );
}
