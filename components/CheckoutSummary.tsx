"use client";

import { CLP, useCart } from "./CartContext";
import { useCheckout } from "./CheckoutStore";

type ShippingZone =
  | "RM"
  | "NO_EXTREMA"
  | "EXTREMOS"
  | "UNKNOWN";

type ComponentShippingSize = "SMALL" | "MEDIUM" | "LARGE" | "XL";

function safeStr(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeText(v: unknown) {
  return safeStr(v)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function zoneByRegion(regionRaw: string): ShippingZone {
  const r = normalizeText(regionRaw);
  if (!r) return "UNKNOWN";

  if (r.includes("metropolitana")) return "RM";

  // Zonas extremas para tu lógica comercial:
  // Arica y Parinacota, Tarapacá, Aysén, Magallanes
   if (
  r.includes("arica") ||
  r.includes("parinacota") ||
  r.includes("tarapac") ||
  r.includes("atacama") ||
  r.includes("ays") ||
  r.includes("magall")
) {
  return "EXTREMOS";
}

  return "NO_EXTREMA";
}

function pcShippingPerUnit(zone: ShippingZone, unitSubtotalTransfer: number) {
  if (zone === "EXTREMOS") return 20000;
  return unitSubtotalTransfer > 1_500_000 ? 15000 : 12000;
}

function componentShippingBySize(zone: ShippingZone, size: ComponentShippingSize) {
  const table: Record<ComponentShippingSize, Record<"RM" | "NO_EXTREMA" | "EXTREMOS", number>> = {
    SMALL: {
      RM: 3990,
      NO_EXTREMA: 5990,
      EXTREMOS: 7990,
    },
    MEDIUM: {
      RM: 4990,
      NO_EXTREMA: 7990,
      EXTREMOS: 9990,
    },
    LARGE: {
      RM: 6990,
      NO_EXTREMA: 10990,
      EXTREMOS: 14990,
    },
    XL: {
      RM: 8990,
      NO_EXTREMA: 13990,
      EXTREMOS: 17990,
    },
  };

  const normalizedZone =
    zone === "UNKNOWN" ? "NO_EXTREMA" : zone;

  return table[size][normalizedZone];
}

function sizeRank(size: ComponentShippingSize) {
  switch (size) {
    case "SMALL":
      return 1;
    case "MEDIUM":
      return 2;
    case "LARGE":
      return 3;
    case "XL":
      return 4;
  }
}

function inferCartItemShippingSize(item: {
  id?: string;
  name?: string;
}): ComponentShippingSize {
  const text = `${normalizeText(item.id)} ${normalizeText(item.name)}`;

  if (text.includes("monitor")) return "XL";

  if (text.includes("gabinete") || text.includes("case")) {
    if (
      text.includes("mini itx") ||
      text.includes("mini-itx") ||
      text.includes("micro atx") ||
      text.includes("micro-atx") ||
      text.includes("matx")
    ) {
      return "LARGE";
    }
    return "XL";
  }

  if (
    text.includes("rtx") ||
    text.includes("radeon") ||
    text.includes("rx ") ||
    text.includes("rx-") ||
    text.includes("gpu") ||
    text.includes("tarjeta de video") ||
    text.includes("placa madre") ||
    text.includes("motherboard")
  ) {
    return "LARGE";
  }

  if (
    text.includes("fuente") ||
    text.includes("psu") ||
    text.includes("cooler") ||
    text.includes("disipador") ||
    text.includes("ventilador") ||
    text.includes("teclado") ||
    text.includes("audifono") ||
    text.includes("headset") ||
    text.includes("webcam") ||
    text.includes("microfono") ||
    text.includes("mousepad")
  ) {
    return "MEDIUM";
  }

  if (
    text.includes("mouse") ||
    text.includes("ram") ||
    text.includes("ssd") ||
    text.includes("nvme") ||
    text.includes("pasta termica") ||
    text.includes("cpu") ||
    text.includes("procesador")
  ) {
    return "SMALL";
  }

  return "MEDIUM";
}

function isPcItem(item: { id?: string; name?: string }) {
  const text = `${normalizeText(item.id)} ${normalizeText(item.name)}`;

  return (
    text.includes("oficina-") ||
    text.includes("entrada-") ||
    text.includes("media-") ||
    text.includes("ryzen") ||
    text.includes("8600g") ||
    text.includes("pc ")
  );
}

function calculateShipping(params: {
  deliveryType: string;
  region?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    priceTransfer: number;
  }>;
}) {
  const { deliveryType, region, items } = params;
  if (deliveryType !== "shipping") return 0;

  const zone = zoneByRegion(region ?? "");

  const pcItems = items.filter((item) => isPcItem(item));
  if (pcItems.length > 0) {
    return pcItems.reduce((acc, item) => {
      const perUnit = pcShippingPerUnit(zone, item.priceTransfer);
      return acc + perUnit * item.quantity;
    }, 0);
  }

  const componentUnits = items.reduce((acc, item) => acc + item.quantity, 0);
  if (componentUnits <= 0) return 0;

  const biggestSize = items.reduce<ComponentShippingSize>((max, item) => {
    const current = inferCartItemShippingSize(item);
    return sizeRank(current) > sizeRank(max) ? current : max;
  }, "SMALL");

  const unitShipping = componentShippingBySize(zone, biggestSize);
  return unitShipping * componentUnits;
}

export default function CheckoutSummary() {
  const { items, subtotalTransfer, subtotalCard } = useCart();
  const { pago, envio } = useCheckout() as any;

  const chosen = pago?.metodo as
    | "transferencia"
    | "webpay"
    | "mercadopago"
    | undefined;

  const deliveryType =
    envio?.tipo === "envio" ||
    envio?.tipo === "shipping" ||
    envio?.tipo === "delivery"
      ? "shipping"
      : "pickup";

  const shipping = calculateShipping({
    deliveryType,
    region: envio?.region,
    items: items.map((it) => ({
      id: it.id,
      name: it.name,
      quantity: it.quantity,
      priceTransfer: it.priceTransfer,
    })),
  });

  const transferLine = {
    label: "Pago con transferencias",
    value: subtotalTransfer,
  };

  const cardLine = {
    label: "Otros medios de pago",
    value: subtotalCard,
  };

  let lines: { label: string; value: number }[] = [];

  if (chosen === "transferencia") lines = [transferLine];
  else if (chosen === "webpay" || chosen === "mercadopago") lines = [cardLine];
  else lines = [transferLine, cardLine];

  const base =
    chosen === "transferencia"
      ? subtotalTransfer
      : chosen === "webpay" || chosen === "mercadopago"
      ? subtotalCard
      : subtotalTransfer;

  const total = base + shipping;

  const isTransfer = chosen === "transferencia";

  const highlight =
    chosen === "webpay" || chosen === "mercadopago"
      ? "card"
      : "transfer";

  return (
    <aside>
      <h3 className="mb-3 text-lg font-bold text-white">
        Resumen ({items.length} {items.length === 1 ? "producto" : "productos"})
      </h3>

      {items.length === 0 ? (
        <p className="text-neutral-300">No tienes productos en el carrito.</p>
      ) : (
        <>
          <div className="divide-y divide-neutral-800">
            {items.map((it) => {
              const lineTransfer = it.priceTransfer * it.quantity;
              const lineCard = it.priceCard * it.quantity;

              return (
                <div key={it.id} className="py-3">
                  <div className="grid grid-cols-[80px_minmax(0,1fr)] md:grid-cols-[100px_minmax(0,1fr)_auto] items-start gap-3 md:gap-4">
                    <div className="h-[80px] w-[80px] md:h-[100px] md:w-[100px] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
                      {it.image ? (
                        <img
                          src={it.image}
                          alt={it.name}
                          draggable={false}
                          className="h-full w-full object-contain md:object-cover p-1 md:p-0"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-neutral-500">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">
                        {it.name}
                      </div>

                      <div className="mt-1 text-xs text-neutral-400">
                        Cantidad: <span className="text-neutral-200">{it.quantity}</span>
                      </div>

                      <div className="mt-3 grid gap-2">
                        <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2">
                          <span className="text-[11px] font-semibold tracking-wide text-neutral-400">
                            TRANSFERENCIA
                          </span>
                          <span
                            className={[
                              "text-sm font-bold tabular-nums",
                              highlight === "transfer"
                                ? "text-lime-400"
                                : "text-neutral-200",
                            ].join(" ")}
                          >
                            {CLP(lineTransfer)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2">
                          <span className="text-[11px] font-semibold tracking-wide text-neutral-400">
                            OTROS MEDIOS
                          </span>
                          <span
                            className={[
                              "text-sm font-bold tabular-nums",
                              highlight === "card"
                                ? "text-lime-400"
                                : "text-neutral-200",
                            ].join(" ")}
                          >
                            {CLP(lineCard)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t border-neutral-800 pt-4 text-sm">
            {lines.map((l) => (
              <div
                key={l.label}
                className="mb-1 flex items-center justify-between"
              >
                <span className="text-neutral-300">{l.label}</span>
                <span className="font-semibold text-neutral-200 tabular-nums">
                  {CLP(l.value)}
                </span>
              </div>
            ))}

            <div className="mb-1 flex items-center justify-between">
              <span className="text-neutral-500">Envío</span>
              <span className="text-neutral-500 tabular-nums">
                {shipping > 0 ? CLP(shipping) : "-"}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-neutral-800 pt-3">
              <span className="font-bold text-neutral-200">TOTAL</span>
              <span className="font-extrabold text-white tabular-nums">
                {CLP(total)}
              </span>
            </div>

            {!isTransfer && (
              <p className="mt-3 text-xs text-amber-300">
                Por ahora solo está disponible la confirmación por transferencia y Mercado pago.
              </p>
            )}
          </div>
        </>
      )}
    </aside>
  );
}