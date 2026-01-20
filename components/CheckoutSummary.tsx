// /components/CheckoutSummary.tsx
"use client";

import { CLP, useCart } from "./CartContext";
import { useCheckout } from "./CheckoutStore";

/**
 * Resumen + Confirmación de pedido.
 * - Si elige transferencia => reserva 24h y muestra número de pedido y PIN de retiro.
 * - Si elige Webpay/MercadoPago => (por ahora) no deja confirmar pedido.
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

  const transferLine = {
    label: "Pago con transferencias",
    value: subtotalTransfer,
  };
  const cardLine = { label: "Otros medios de pago", value: subtotalCard };

  // Líneas a mostrar según elección
  let lines: { label: string; value: number }[] = [];
  if (chosen === "transferencia") lines = [transferLine];
  else if (chosen === "webpay" || chosen === "mercadopago")
    lines = [cardLine];
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
  // 👇 Solo permitimos confirmar si hay items Y el medio es transferencia
  const canConfirm = items.length > 0 && isTransfer;

  async function handleConfirm() {
    if (!canConfirm) {
      // Seguridad extra: si por algún bug llega aquí sin ser transferencia, salimos.
      alert(
        "Por ahora solo puedes confirmar pedidos pagando por transferencia. El resto de medios se activará más adelante."
      );
      return;
    }

    // 1) Orden local (para número y pickupCode)
    const { createOrder } = await import("@/data/orders");

    const order = createOrder({
      paymentMethod: chosen!, // 'transferencia' en este flujo
      shipping: envio ?? { tipo: "retiro", costoEnvio: 0 },
      customer: contacto ?? {},
      items: items.map((it) => ({
        slug: it.id, // usamos el id del carrito como slug / identificador visual
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

    // 2) Llamar a la API /api/checkout para validar stock y crear el pedido real en Supabase
    try {
      const deliveryType =
        envio?.tipo === "envio" ? ("shipping" as const) : ("pickup" as const);

      const payload = {
        items: items.map((it) => ({
          // Mantengo exactamente la misma estructura que ya usabas
          // (productSlug o productId según tu endpoint actual).
          // NO tocamos esto para no romper nada que ya funciona.
          productId: it.id, // si tu endpoint usa slug, cámbialo a productSlug: it.id
          quantity: it.quantity,
        })),
        customer: {
          name: contacto?.name ?? "",
          email: contacto?.email ?? "",
          phone: contacto?.phone ?? "",
        },
        deliveryType,
        paymentMethod: chosen ?? "transferencia", // 👈 AHORA se envía explícito
        address:
          deliveryType === "shipping"
            ? {
                fullName: contacto?.name ?? "",
                phone: contacto?.phone ?? "",
                // estos campos los rellenamos con lo que tengas en `envio`
                street: envio?.calle ?? envio?.street ?? "S/D",
                number: envio?.numero ?? envio?.number ?? "",
                apartment: envio?.depto ?? envio?.apartment ?? "",
                commune: envio?.comuna ?? "",
                city: envio?.ciudad ?? envio?.comuna ?? "S/D",
                region: envio?.region ?? "S/D",
                country: "Chile",
              }
            : undefined,
        // por si usas comentarios/notas en el paso de pago
        notes: pago?.comentarios ?? "",
      };

      const resp = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!resp.ok || !data?.ok) {
        alert(
          data?.error ??
            "No se pudo crear el pedido (por ejemplo, stock agotado o error del servidor)."
        );
        return; // no limpiamos carrito, no mostramos “gracias”
      }

      // 3) Solo si la API dijo OK: limpiamos carrito y mostramos mensaje de éxito
      clear();

      if (order.shipping?.tipo === "retiro" && order.pickupCode) {
        alert(
          `¡Gracias! Tu pedido N°${order.number} fue creado.\nCódigo de retiro: ${order.pickupCode}`
        );
      } else {
        alert(`¡Gracias! Tu pedido N°${order.number} fue creado.`);
      }
    } catch (err) {
      console.error("Error en handleConfirm:", err);
      alert("Ocurrió un error al crear el pedido. Intenta nuevamente.");
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
              <span className="font-extrabold text-white">
                {CLP(total)}
              </span>
            </div>

            {/* Mensaje sobre métodos de pago */}
            {!isTransfer && (
              <p className="mt-3 text-xs text-amber-300">
                Por ahora solo está disponible la confirmación por
                transferencia. Las otras opciones se activarán más adelante.
              </p>
            )}

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
