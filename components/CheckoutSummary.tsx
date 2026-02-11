// /components/CheckoutSummary.tsx
"use client";

import { CLP, useCart } from "./CartContext";
import { useCheckout } from "./CheckoutStore";

/**
 * Resumen SOLO visual.
 * La confirmación de pedido ahora se hace en app/checkout/confirmacion/page.tsx
 * (botón junto a "Volver a confirmación").
 */
export default function CheckoutSummary() {
  const { items, subtotalTransfer, subtotalCard } = useCart();
  const { pago, envio } = useCheckout() as any;

  const chosen = pago?.metodo as
    | "transferencia"
    | "webpay"
    | "mercadopago"
    | undefined;

  const shipping = envio?.costoEnvio ?? 0;

  const transferLine = {
    label: "Pago con transferencias",
    value: subtotalTransfer,
  };
  const cardLine = { label: "Otros medios de pago", value: subtotalCard };

  // Líneas a mostrar según elección
  let lines: { label: string; value: number }[] = [];
  if (chosen === "transferencia") lines = [transferLine];
  else if (chosen === "webpay" || chosen === "mercadopago") lines = [cardLine];
  else lines = [transferLine, cardLine];

  // Base del total según método (antes de elegir, usamos transferencia como referencia)
  const base =
    chosen === "transferencia"
      ? subtotalTransfer
      : chosen === "webpay" || chosen === "mercadopago"
      ? subtotalCard
      : subtotalTransfer;

  const total = base + shipping;

  const isTransfer = chosen === "transferencia";

  return (
    <aside>
      <h3 className="mb-3 text-lg font-bold text-white">
        Resumen ({items.length} {items.length === 1 ? "producto" : "productos"})
      </h3>

      {items.length === 0 ? (
        <p className="text-neutral-300">No tienes productos en el carrito.</p>
      ) : (
        <>
          {/* Ítems */}
          <div className="divide-y divide-neutral-800">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 py-3">
                <div className="thumb shrink-0 overflow-hidden rounded-md bg-neutral-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.image || "/pc1.jpg"}
                    alt={it.name}
                    draggable={false}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">
                    {it.name}
                  </div>
                  <div className="text-xs text-neutral-400">
                    Cantidad: {it.quantity}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-lime-400">
                    {CLP(it.priceTransfer)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {CLP(it.priceCard)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="mt-4 border-t border-neutral-800 pt-4 text-sm">
            {lines.map((l) => (
              <div
                key={l.label}
                className="mb-1 flex items-center justify-between"
              >
                <span className="text-neutral-300">{l.label}</span>
                <span className="font-semibold text-neutral-200">
                  {CLP(l.value)}
                </span>
              </div>
            ))}

            <div className="mb-1 flex items-center justify-between">
              <span className="text-neutral-500">Envío</span>
              <span className="text-neutral-500">
                {shipping > 0 ? CLP(shipping) : "-"}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-neutral-800 pt-3">
              <span className="font-bold text-neutral-200">TOTAL</span>
              <span className="font-extrabold text-white">{CLP(total)}</span>
            </div>

            {/* Mensaje sobre métodos de pago */}
            {!isTransfer && (
              <p className="mt-3 text-xs text-amber-300">
                Por ahora solo está disponible la confirmación por
                transferencia. Las otras opciones se activarán más adelante.
              </p>
            )}
            {/* Aquí ya NO hay botón de "Confirmar pedido".
                El único botón de confirmación vive en la página de confirmación. */}
          </div>
        </>
      )}
    </aside>
  );
}
