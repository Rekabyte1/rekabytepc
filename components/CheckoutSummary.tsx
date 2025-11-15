// /components/CheckoutSummary.tsx
"use client";

import { CLP, useCart } from "./CartContext";
import { useCheckout } from "./CheckoutStore";

/**
 * Resumen + Confirmación de pedido.
 * - Si elige transferencia => reserva 24h y muestra número de pedido y PIN de retiro.
 * - Si elige Webpay/MercadoPago => reserva temporal (2h). Cuando marques pagado, descontará del stock.
 */
export default function CheckoutSummary() {
  const { items, subtotalTransfer, subtotalCard, clear } = useCart();
  const { pago, envio, contacto } = useCheckout() as any;

  const chosen = pago?.metodo as
    | "transferencia"
    | "webpay"
    | "mercadopago"
    | undefined;

  const shipping = envio?.costoEnvio ?? 0;

  const transferLine = { label: "Pago con transferencias", value: subtotalTransfer };
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
  const canConfirm = items.length > 0 && !!chosen;

  async function handleConfirm() {
    if (!canConfirm) return;

    // Import dinámico para evitar “Export ... doesn't exist in target module”
    const { createOrder } = await import("@/data/orders");

    const order = createOrder({
      paymentMethod: chosen!,
      shipping: envio ?? { tipo: "retiro", costoEnvio: 0 },
      customer: contacto ?? {},
      items: items.map((it) => ({
        slug: it.id,
        name: it.name,
        qty: it.quantity,
        image: it.image,
        priceTransfer: it.priceTransfer,
        priceCard: it.priceCard,
      })),
      amounts: {
        subtotalTransfer,
        subtotalCard,
        shipping,
        total,
      },
    });

    clear();

    if (order.shipping?.tipo === "retiro" && order.pickupCode) {
      alert(
        `¡Gracias! Tu pedido N°${order.number} fue creado.\nCódigo de retiro: ${order.pickupCode}`
      );
    } else {
      alert(`¡Gracias! Tu pedido N°${order.number} fue creado.`);
    }
  }

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
                  <img src={it.image || "/pc1.jpg"} alt={it.name} draggable={false} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{it.name}</div>
                  <div className="text-xs text-neutral-400">Cantidad: {it.quantity}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-lime-400">{CLP(it.priceTransfer)}</div>
                  <div className="text-xs text-neutral-500">{CLP(it.priceCard)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="mt-4 border-t border-neutral-800 pt-4 text-sm">
            {lines.map((l) => (
              <div key={l.label} className="mb-1 flex items-center justify-between">
                <span className="text-neutral-300">{l.label}</span>
                <span className="font-semibold text-neutral-200">{CLP(l.value)}</span>
              </div>
            ))}

            <div className="mb-1 flex items-center justify-between">
              <span className="text-neutral-500">Envío</span>
              <span className="text-neutral-500">{shipping > 0 ? CLP(shipping) : "-"}</span>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-neutral-800 pt-3">
              <span className="font-bold text-neutral-200">TOTAL</span>
              <span className="font-extrabold text-white">{CLP(total)}</span>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`mt-4 w-full rounded-xl py-3 font-semibold ${
                canConfirm
                  ? "bg-lime-400 text-black hover:bg-lime-300"
                  : "cursor-not-allowed border border-neutral-700 bg-neutral-800 text-neutral-300"
              }`}
            >
              Confirmar pedido
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
