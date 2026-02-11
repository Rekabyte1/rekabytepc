// app/checkout/confirmacion/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { useCheckout } from "@/components/CheckoutStore";
import { useCart, CLP } from "@/components/CartContext";
import { useCheckoutGuard } from "@/components/useCheckoutGuard";

type Stage = "review" | "upload";

export default function Paso4Confirmacion() {
  useCheckoutGuard(4); // 👈 Protege el último paso

  const { datos, pago, envio } = useCheckout() as any;
  const {
    items,
    subtotalTransfer,
    subtotalCard,
    clear: clearCart,
  } = useCart();

  // Estado local: mismo paso 4 con dos "apartados"
  const [stage, setStage] = useState<Stage>("review");
  const [orderId, setOrderId] = useState<string>("");

  // Estado para crear la orden
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Genera y fija un ID “visual” al pasar a "upload"
  useEffect(() => {
    if (stage === "upload" && !orderId) {
      const id = "RB" + Date.now().toString().slice(-6);
      setOrderId(id);
    }
  }, [stage, orderId]);

  const payingWithTransfer =
    (pago?.metodo ?? "transferencia") === "transferencia";

  const selectedSubtotal = useMemo(
    () => (payingWithTransfer ? subtotalTransfer : subtotalCard),
    [payingWithTransfer, subtotalTransfer, subtotalCard]
  );

  const total = selectedSubtotal + (envio?.costoEnvio ?? 0);

  // --- Handler único para confirmar el pedido (MISMA LÓGICA QUE ANTES) ---
  async function handleConfirmPedido() {
    if (!items.length) {
      alert("Tu carrito está vacío.");
      return;
    }

    setErrorMsg(null);
    setCreating(true);

    try {
      const paymentMethod =
        (pago?.metodo ?? "transferencia") as
          | "transferencia"
          | "webpay"
          | "mercadopago";

      const shippingAmount = envio?.costoEnvio ?? 0;

      // 1) Crear orden local (para número y código de retiro),
      const { createOrder } = await import("@/data/orders");

      const localOrder = createOrder({
        paymentMethod,
        shipping: envio ?? { tipo: "retiro", costoEnvio: shippingAmount },
        customer: datos ?? {},
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
          shipping: shippingAmount,
          total,
        },
      });

      // 2) Llamar a la API /api/checkout
      const deliveryType =
        envio?.tipo === "envio" ? ("shipping" as const) : ("pickup" as const);

      const payload = {
        items: items.map((it) => ({
          productSlug: it.id,
          quantity: it.quantity,
        })),
        customer: {
          name:
            (datos?.nombre
              ? `${datos.nombre} ${datos.apellido ?? ""}`.trim()
              : datos?.nombre) ?? "EMPTY",
          email: datos?.email ?? "EMPTY",
          phone: datos?.telefono ?? "",
        },
        deliveryType,
        paymentMethod,
        address:
          deliveryType === "shipping"
            ? {
                street: envio?.direccion ?? "",
                number: (envio as any)?.numero ?? "",
                apartment: (envio as any)?.departamento ?? "",
                commune: (envio as any)?.comuna ?? "",
                city: (envio as any)?.ciudad ?? "",
                region: (envio as any)?.region ?? "",
                country: "Chile",
              }
            : undefined,
        notes: (pago as any)?.comentarios ?? "",
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: any = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        alert(
          data?.error ??
            "No se pudo crear el pedido (por ejemplo, stock agotado o error del servidor)."
        );
        return;
      }

      // 3) Solo si la API respondió OK
      clearCart();
      setCreated(true);

      if (localOrder.shipping?.tipo === "retiro" && localOrder.pickupCode) {
        alert(
          `¡Gracias! Tu pedido N°${localOrder.number} fue creado.\nCódigo de retiro: ${localOrder.pickupCode}`
        );
      } else {
        alert(`¡Gracias! Tu pedido N°${localOrder.number} fue creado.`);
      }
    } catch (err: any) {
      console.error("Error confirmando pedido:", err);
      setErrorMsg(
        err?.message ?? "Ocurrió un error al crear el pedido. Intenta nuevamente."
      );
      alert(
        err?.message ??
          "Ocurrió un error al crear el pedido. Intenta nuevamente."
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="checkout-page">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-2 text-2xl font-extrabold text-white">
          Confirmación
        </h1>
        <CheckoutSteps active={3} />

        <div className="grid-two">
          {/* IZQUIERDA */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
            {stage === "review" ? (
              <>
                {/* Forma de entrega */}
                <div className="mb-5">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-100">
                      Forma de entrega
                    </h3>
                    <Link href="/checkout/envio" className="text-lime-400">
                      Modificar
                    </Link>
                  </div>
                  <div className="text-sm text-neutral-300">
                    {envio?.tipo === "pickup" ? (
                      <>
                        Retiro en tienda (gratis)
                        <br />
                        Real Audiencia 1170, San Miguel
                      </>
                    ) : (
                      <>
                        Despacho a domicilio
                        <br />
                        {envio?.direccion ?? "Dirección no especificada"}
                      </>
                    )}
                    <div className="mt-1 text-neutral-400">
                      Costo envío:{" "}
                      <span className="text-neutral-200">
                        {CLP(envio?.costoEnvio ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medio de pago */}
                <div className="mb-5">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-100">
                      Medio de pago
                    </h3>
                    <Link href="/checkout/pago" className="text-lime-400">
                      Modificar
                    </Link>
                  </div>
                  <div className="text-sm text-neutral-300">
                    {payingWithTransfer ? (
                      <>
                        Transferencia / Depósito bancario
                        <div className="text-neutral-400">
                          Documento: {pago?.documento ?? "boleta"}
                        </div>
                      </>
                    ) : pago?.metodo === "webpay" ? (
                      <>Webpay</>
                    ) : (
                      <>Mercado Pago</>
                    )}
                  </div>
                </div>

                {/* Acciones: aquí solo mostramos info y pasamos a "upload" */}
                <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                  {payingWithTransfer ? (
                    <>
                      <p className="text-sm text-neutral-300">
                        Al confirmar te mostraremos los datos bancarios para
                        realizar la transferencia. Tendrás{" "}
                        <strong>24 horas</strong> para subir tu/ tus
                        comprobantes.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          className="rb-btn"
                          onClick={() => setStage("upload")}
                        >
                          Confirmar compra y ver datos de transferencia
                        </button>
                        <Link href="/" className="rb-btn--ghost rb-btn">
                          Volver al inicio
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-neutral-300">
                        Revisa que tus datos sean correctos antes de continuar.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button className="rb-btn">Pagar</button>
                        <Link
                          href="/checkout/pago"
                          className="rb-btn--ghost rb-btn"
                        >
                          Cambiar medio de pago
                        </Link>
                      </div>
                    </>
                  )}
                </div>

                {/* Total */}
                <div className="mt-6 text-right text-lg font-bold text-neutral-100">
                  Total a pagar:{" "}
                  <span className="text-lime-400">{CLP(total)}</span>
                </div>
              </>
            ) : (
              // === Apartado "Subir comprobantes" dentro del mismo paso 4 ===
              <>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Subir comprobantes{" "}
                    <span className="text-sm font-normal text-neutral-300">
                      — Orden{" "}
                      <span className="font-semibold text-white">
                        #{orderId}
                      </span>
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-neutral-300">
                    Realiza la(s) transferencia(s) y adjunta los comprobantes lo
                    antes posible. Reservaremos los productos por un máximo de{" "}
                    <strong>24 horas</strong>.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Izquierda: upload */}
                  <div className="rounded-xl border border-neutral-800 p-4">
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      Adjunta tus comprobantes
                    </h3>
                    <div className="rounded-lg border border-dashed border-neutral-700 p-6 text-center">
                      <input
                        type="file"
                        multiple
                        className="mx-auto block text-sm text-neutral-200"
                      />
                      <p className="mt-2 text-xs text-neutral-500">
                        Formatos: pdf, jpg, jpeg, png. Máx. 10&nbsp;MB por
                        archivo.
                      </p>
                    </div>
                    <button className="rb-btn mt-4">
                      Guardar comprobantes
                    </button>
                  </div>

                  {/* Derecha: datos bancarios */}
                  <div className="rounded-xl border border-neutral-800 p-4">
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      Datos para transferir
                    </h3>

                    <h4 className="text-sm font-semibold text-neutral-100">
                      Titular
                    </h4>
                    <ul className="mt-1 space-y-1 list-disc pl-5 text-sm text-neutral-100">
                      <li>
                        <span className="text-neutral-400">Nombre:</span> Reka
                        SPA
                      </li>
                      <li>
                        <span className="text-neutral-400">RUT:</span>{" "}
                        20.420.860-0
                      </li>
                      <li>
                        <span className="text-neutral-400">Correo:</span>{" "}
                        reka@byte.cl
                      </li>
                    </ul>

                    <h4 className="mt-4 text-sm font-semibold text-neutral-100">
                      Cuentas disponibles
                    </h4>
                    <ul className="mt-1 space-y-1 list-disc pl-5 text-sm text-neutral-100">
                      <li>
                        <strong>Banco Santander</strong> – Cuenta Corriente
                        6xxxx (Reka SPA)
                      </li>
                      <li>
                        <strong>Banco Estado</strong> – Cuenta Corriente 1xxxxx
                        (Reka SPA)
                      </li>
                    </ul>

                    <p className="mt-4 text-xs text-neutral-400">
                      Una vez hecha la transferencia, sube el comprobante en
                      esta misma página o envíalo a{" "}
                      <span className="font-semibold">reka@byte.cl</span>.
                      Mantendremos tu pedido reservado por 24 horas mientras
                      esperamos el pago.
                    </p>
                  </div>
                </div>

                {errorMsg && (
                  <p className="mt-4 text-sm text-red-400">{errorMsg}</p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rb-btn--ghost rb-btn"
                    onClick={() => setStage("review")}
                    disabled={creating}
                  >
                    Volver a confirmación
                  </button>
                  <button
                    type="button"
                    className="rb-btn"
                    onClick={handleConfirmPedido}
                    disabled={creating || created}
                  >
                    {created
                      ? "Pedido confirmado"
                      : creating
                      ? "Confirmando..."
                      : "Confirmar pedido"}
                  </button>
                </div>
              </>
            )}
          </section>

          {/* DERECHA — Resumen SOLO visual (sin botón de confirmar) */}
          <CheckoutSummary />
        </div>
      </div>
    </main>
  );
}
