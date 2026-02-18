"use client";

import { CLP, useCart } from "./CartContext";
import { useCheckout } from "./CheckoutStore";

type ShippingZone = "RM" | "CENTRO" | "NORTE" | "SUR" | "EXTREMOS" | "UNKNOWN";

function safeStr(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

function zoneByRegion(regionRaw: string): ShippingZone {
  const r = safeStr(regionRaw);
  if (!r) return "UNKNOWN";

  if (r.includes("metropolitana")) return "RM";
  if (r.includes("arica") || r.includes("tarapac") || r.includes("antofag") || r.includes("atacama") || r.includes("coquimbo")) return "NORTE";
  if (r.includes("valpara") || r.includes("ohiggins") || r.includes("maule") || r.includes("ñuble") || r.includes("biob")) return "CENTRO";
  if (r.includes("araucan") || r.includes("rios") || r.includes("lagos")) return "SUR";
  if (r.includes("ays") || r.includes("magall")) return "EXTREMOS";

  return "UNKNOWN";
}

function shippingCostByZone(zone: ShippingZone) {
  switch (zone) {
    case "RM": return 6990;
    case "CENTRO": return 8990;
    case "NORTE": return 10990;
    case "SUR": return 10990;
    case "EXTREMOS": return 14990;
    default: return 11990;
  }
}

function calculateShipping(deliveryType: string, region?: string) {
  if (deliveryType !== "shipping") return 0;
  const zone = zoneByRegion(region ?? "");
  return shippingCostByZone(zone);
}

export default function CheckoutSummary() {
  const { items, subtotalTransfer, subtotalCard } = useCart();
  const { pago, envio } = useCheckout() as any;

  const chosen = pago?.metodo;
  const deliveryType =
    envio?.tipo === "envio" ||
    envio?.tipo === "shipping" ||
    envio?.tipo === "delivery"
      ? "shipping"
      : "pickup";

  const shipping = calculateShipping(deliveryType, envio?.region);

  const base =
    chosen === "transferencia"
      ? subtotalTransfer
      : chosen === "webpay" || chosen === "mercadopago"
      ? subtotalCard
      : subtotalTransfer;

  const total = base + shipping;

  return (
    <aside className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
      <h3 className="mb-4 text-base font-bold text-white">
        Resumen ({items.length})
      </h3>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">
          No tienes productos en el carrito.
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((it) => {
              const lineTransfer = it.priceTransfer * it.quantity;
              const lineCard = it.priceCard * it.quantity;

              return (
                <div key={it.id} className="flex gap-3">
                  
                  {/* Imagen optimizada mobile */}
                  <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
                    {it.image ? (
                      <img
                        src={it.image}
                        alt={it.name}
                        className="w-full h-full object-contain p-2"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {it.name}
                    </div>

                    <div className="mt-1 text-xs text-neutral-400">
                      Cantidad: {it.quantity}
                    </div>

                    {/* Precios compactos */}
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between text-neutral-400">
                        <span>Transferencia</span>
                        <span className="font-semibold text-lime-400 tabular-nums">
                          {CLP(lineTransfer)}
                        </span>
                      </div>

                      <div className="flex justify-between text-neutral-400">
                        <span>Otros medios</span>
                        <span className="font-semibold text-neutral-200 tabular-nums">
                          {CLP(lineCard)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totales */}
          <div className="mt-6 border-t border-neutral-800 pt-4 text-sm space-y-2">
            <div className="flex justify-between text-neutral-300">
              <span>Subtotal</span>
              <span className="tabular-nums">{CLP(base)}</span>
            </div>

            <div className="flex justify-between text-neutral-500">
              <span>Envío</span>
              <span className="tabular-nums">
                {shipping > 0 ? CLP(shipping) : "-"}
              </span>
            </div>

            <div className="flex justify-between border-t border-neutral-800 pt-3 font-bold text-white text-base">
              <span>Total</span>
              <span className="tabular-nums">{CLP(total)}</span>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
