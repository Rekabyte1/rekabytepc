// app/checkout/confirmacion/page.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { useCheckout } from "@/components/CheckoutStore";
import { useCart, CLP } from "@/components/CartContext";
import { useCheckoutGuard } from "@/components/useCheckoutGuard";

type Stage = "review" | "upload";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={`cs-copy ${copied ? "is-copied" : ""}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        } catch {
          // ignore
        }
      }}
      aria-label="Copiar"
      title="Copiar"
    >
      {copied ? "Copiado" : "Copiar"}
      <style jsx>{`
        .cs-copy {
          border: 1px solid #2a2a2a;
          background: rgba(20, 20, 20, 0.55);
          color: #e5e7eb;
          font-weight: 900;
          font-size: 12px;
          padding: 7px 10px;
          border-radius: 999px;
          cursor: pointer;
          white-space: nowrap;
          transition: border-color 0.15s ease, color 0.15s ease;
        }
        .cs-copy:hover {
          border-color: #3a3a3a;
        }
        .cs-copy.is-copied {
          border-color: rgba(182, 255, 46, 0.6);
          color: #b6ff2e;
        }
      `}</style>
    </button>
  );
}

export default function Paso4Confirmacion() {
  useCheckoutGuard(4);

  const { datos, pago, envio } = useCheckout() as any;
  const { items, subtotalTransfer, subtotalCard, clear: clearCart } = useCart();

  const [stage, setStage] = useState<Stage>("review");
  const [orderId, setOrderId] = useState<string>("");

  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (stage === "upload" && !orderId) {
      const id = "RB" + Date.now().toString().slice(-6);
      setOrderId(id);
    }
  }, [stage, orderId]);

  const payingWithTransfer = (pago?.metodo ?? "transferencia") === "transferencia";

  const selectedSubtotal = useMemo(
    () => (payingWithTransfer ? subtotalTransfer : subtotalCard),
    [payingWithTransfer, subtotalTransfer, subtotalCard]
  );

  const total = selectedSubtotal + (envio?.costoEnvio ?? 0);

  async function handleConfirmPedido() {
    if (!items.length) {
      alert("Tu carrito está vacío.");
      return;
    }

    setErrorMsg(null);
    setCreating(true);

    try {
      const paymentMethod = (pago?.metodo ?? "transferencia") as
        | "transferencia"
        | "webpay"
        | "mercadopago";

      const shippingAmount = envio?.costoEnvio ?? 0;

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

      const deliveryType = envio?.tipo === "envio" ? ("shipping" as const) : ("pickup" as const);

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
      setErrorMsg(err?.message ?? "Ocurrió un error al crear el pedido. Intenta nuevamente.");
      alert(err?.message ?? "Ocurrió un error al crear el pedido. Intenta nuevamente.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="rb-container checkout-step">
      <h1 className="cs-title">Confirmación</h1>

      <div className="cs-steps">
        <CheckoutSteps active={3} />
      </div>

      <div className="cs-grid">
        {/* IZQUIERDA */}
        <section className="cs-card">
          <div className="cs-head">
            <div className="cs-accent" />
            <div>
              <h2 className="cs-card-title">Paso 4: Revisa y confirma</h2>
              <p className="cs-card-sub">
                Verifica entrega y pago. Luego confirma el pedido.
              </p>
            </div>
          </div>

          {stage === "review" ? (
            <>
              <div className="cs-panels">
                {/* Entrega */}
                <div className="cs-panel">
                  <div className="cs-panel-top">
                    <div>
                      <div className="cs-panel-title">Forma de entrega</div>
                      <div className="cs-panel-sub">
                        {envio?.tipo === "pickup" ? (
                          <>
                            Retiro en tienda (gratis)
                            <span className="cs-muted"> · Real Audiencia 1170, San Miguel</span>
                          </>
                        ) : (
                          <>
                            Despacho a domicilio
                            <span className="cs-muted">
                              {" "}
                              · {envio?.direccion ?? "Dirección no especificada"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <Link href="/checkout/envio" className="cs-link">
                      Modificar
                    </Link>
                  </div>

                  <div className="cs-line-row">
                    <span className="cs-muted">Costo envío</span>
                    <span className="cs-strong">{CLP(envio?.costoEnvio ?? 0)}</span>
                  </div>
                </div>

                {/* Pago */}
                <div className="cs-panel">
                  <div className="cs-panel-top">
                    <div>
                      <div className="cs-panel-title">Medio de pago</div>
                      <div className="cs-panel-sub">
                        {payingWithTransfer ? (
                          <>
                            Transferencia / Depósito bancario
                            <span className="cs-muted"> · Documento: {pago?.documento ?? "boleta"}</span>
                          </>
                        ) : pago?.metodo === "webpay" ? (
                          <>Webpay</>
                        ) : (
                          <>Mercado Pago</>
                        )}
                      </div>
                    </div>

                    <Link href="/checkout/pago" className="cs-link">
                      Modificar
                    </Link>
                  </div>

                  {!payingWithTransfer && (
                    <div className="cs-note">
                      Este método está en preparación. Por ahora el flujo final de confirmación está habilitado
                      para transferencia.
                    </div>
                  )}
                </div>
              </div>

              {/* Caja de acción */}
              <div className="cs-callout">
                {payingWithTransfer ? (
                  <>
                    <div className="cs-callout-title">Antes de confirmar</div>
                    <p className="cs-callout-text">
                      Al confirmar verás los datos bancarios para realizar la transferencia. Tendrás{" "}
                      <span className="cs-strong">24 horas</span> para subir tus comprobantes.
                    </p>

                    <div className="cs-actions">
                      <button type="button" className="rb-btn" onClick={() => setStage("upload")}>
                        Confirmar compra y ver datos de transferencia
                      </button>
                      <Link href="/" className="rb-btn rb-btn--ghost">
                        Volver al inicio
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="cs-callout-title">Revisión</div>
                    <p className="cs-callout-text">
                      Revisa que tus datos sean correctos antes de continuar.
                    </p>

                    <div className="cs-actions">
                      <button type="button" className="rb-btn" disabled>
                        Pagar
                      </button>
                      <Link href="/checkout/pago" className="rb-btn rb-btn--ghost">
                        Cambiar medio de pago
                      </Link>
                    </div>
                  </>
                )}
              </div>

              <div className="cs-total">
                <span>Total a pagar</span>
                <span className="cs-total-amount">{CLP(total)}</span>
              </div>
            </>
          ) : (
            <>
              {/* UPLOAD */}
              <div className="cs-upload-head">
                <div>
                  <div className="cs-upload-title">
                    Subir comprobantes{" "}
                    <span className="cs-upload-order">
                      — Orden <span className="cs-upload-order-id">#{orderId}</span>
                    </span>
                  </div>
                  <p className="cs-upload-sub">
                    Realiza la(s) transferencia(s) y adjunta los comprobantes lo antes posible. Reservaremos los
                    productos por un máximo de <span className="cs-strong">24 horas</span>.
                  </p>
                </div>
              </div>

              <div className="cs-upload-grid">
                {/* Dropzone */}
                <div className="cs-panel">
                  <div className="cs-panel-title">Adjunta tus comprobantes</div>
                  <div className="cs-drop">
                    <div className="cs-drop-inner">
                      <div className="cs-drop-title">Arrastra archivos aquí</div>
                      <div className="cs-drop-sub">o selecciona desde tu equipo</div>

                      <label className="cs-file-btn">
                        Seleccionar archivos
                        <input type="file" multiple className="cs-file-input" />
                      </label>

                      <div className="cs-drop-help">
                        Formatos: pdf, jpg, jpeg, png. Máx. 10 MB por archivo.
                      </div>
                    </div>
                  </div>

                  <button type="button" className="rb-btn cs-save" disabled>
                    Guardar comprobantes
                  </button>

                  <div className="cs-note">
                    La subida real de archivos está pendiente. Esta sección es visual.
                  </div>
                </div>

                {/* Datos bancarios */}
                <div className="cs-panel">
                  <div className="cs-panel-title">Datos para transferir</div>

                  <div className="cs-kv">
                    <div className="cs-kv-row">
                      <div className="cs-kv-left">
                        <div className="cs-kv-key">Titular</div>
                        <div className="cs-kv-val">Reka SPA</div>
                      </div>
                      <CopyButton value="Reka SPA" />
                    </div>

                    <div className="cs-kv-row">
                      <div className="cs-kv-left">
                        <div className="cs-kv-key">RUT</div>
                        <div className="cs-kv-val">20.420.860-0</div>
                      </div>
                      <CopyButton value="20.420.860-0" />
                    </div>

                    <div className="cs-kv-row">
                      <div className="cs-kv-left">
                        <div className="cs-kv-key">Correo</div>
                        <div className="cs-kv-val">reka@byte.cl</div>
                      </div>
                      <CopyButton value="reka@byte.cl" />
                    </div>
                  </div>

                  <div className="cs-divider" />

                  <div className="cs-panel-title">Cuentas disponibles</div>
                  <ul className="cs-list">
                    <li>
                      <span className="cs-strong">Banco Santander</span> — Cuenta Corriente 6xxxx (Reka SPA)
                    </li>
                    <li>
                      <span className="cs-strong">Banco Estado</span> — Cuenta Corriente 1xxxxx (Reka SPA)
                    </li>
                  </ul>

                  <p className="cs-help">
                    Una vez hecha la transferencia, sube el comprobante aquí o envíalo a{" "}
                    <span className="cs-strong">reka@byte.cl</span>. Mantendremos tu pedido reservado por 24 horas
                    mientras esperamos el pago.
                  </p>
                </div>
              </div>

              {errorMsg && <p className="cs-error">{errorMsg}</p>}

              <div className="cs-actions">
                <button
                  type="button"
                  className="rb-btn rb-btn--ghost"
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
                  {created ? "Pedido confirmado" : creating ? "Confirmando..." : "Confirmar pedido"}
                </button>
              </div>
            </>
          )}
        </section>

        {/* DERECHA */}
        <aside className="cs-summary">
          <CheckoutSummary />
        </aside>
      </div>

      <style jsx>{`
        .checkout-step {
          padding-top: 24px;
          padding-bottom: 24px;
        }

        .cs-title {
          margin: 0 0 10px;
          font-size: 30px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .cs-steps {
          margin-bottom: 14px;
        }

        .cs-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          align-items: start;
        }

        @media (min-width: 1024px) {
          .cs-grid {
            grid-template-columns: 1fr 420px;
            gap: 22px;
          }
        }

        .cs-card {
          background: #0d0d0d;
          border: 1px solid #262626;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
        }

        .cs-head {
          display: grid;
          grid-template-columns: 10px 1fr;
          gap: 12px;
          align-items: start;
          margin-bottom: 14px;
        }

        .cs-accent {
          width: 4px;
          height: 24px;
          border-radius: 999px;
          background: #b6ff2e;
          margin-top: 2px;
        }

        .cs-card-title {
          margin: 0;
          color: #fff;
          font-size: 18px;
          font-weight: 800;
        }

        .cs-card-sub {
          margin: 6px 0 0;
          color: #a3a3a3;
          font-size: 14px;
          line-height: 1.5;
        }

        .cs-summary {
          position: sticky;
          top: 1.5rem;
        }

        .cs-panels {
          display: grid;
          gap: 12px;
        }

        .cs-panel {
          border: 1px solid #262626;
          background: rgba(20, 20, 20, 0.35);
          border-radius: 14px;
          padding: 12px;
        }

        .cs-panel-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 10px;
        }

        .cs-panel-title {
          color: #e5e7eb;
          font-weight: 900;
          font-size: 14px;
        }

        .cs-panel-sub {
          margin-top: 4px;
          color: #d4d4d4;
          font-size: 13px;
          line-height: 1.45;
        }

        .cs-link {
          color: #b6ff2e;
          font-weight: 900;
          font-size: 13px;
          text-decoration: none;
          white-space: nowrap;
        }

        .cs-link:hover {
          color: #d7ff54;
        }

        .cs-line-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 13px;
        }

        .cs-muted {
          color: #a3a3a3;
        }

        .cs-strong {
          font-weight: 900;
          color: #e5e7eb;
        }

        .cs-note {
          margin-top: 10px;
          color: #737373;
          font-size: 12px;
          line-height: 1.45;
        }

        .cs-callout {
          margin-top: 12px;
          border: 1px solid rgba(182, 255, 46, 0.25);
          background: rgba(182, 255, 46, 0.06);
          border-radius: 14px;
          padding: 12px;
        }

        .cs-callout-title {
          color: #e5e7eb;
          font-weight: 900;
          font-size: 14px;
          margin-bottom: 6px;
        }

        .cs-callout-text {
          margin: 0;
          color: #d4d4d4;
          font-size: 13px;
          line-height: 1.5;
        }

        .cs-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .cs-actions .rb-btn {
          min-width: 160px;
        }

        .cs-total {
          margin-top: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          color: #e5e7eb;
          font-weight: 900;
          font-size: 14px;
        }

        .cs-total-amount {
          color: #b6ff2e;
          font-size: 16px;
        }

        .cs-upload-head {
          margin-top: 2px;
        }

        .cs-upload-title {
          color: #fff;
          font-weight: 900;
          font-size: 18px;
        }

        .cs-upload-order {
          color: #a3a3a3;
          font-weight: 700;
          font-size: 13px;
        }

        .cs-upload-order-id {
          color: #fff;
          font-weight: 900;
        }

        .cs-upload-sub {
          margin: 6px 0 0;
          color: #d4d4d4;
          font-size: 13px;
          line-height: 1.5;
        }

        .cs-upload-grid {
          display: grid;
          gap: 12px;
          margin-top: 12px;
        }

        @media (min-width: 900px) {
          .cs-upload-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .cs-drop {
          border: 1px dashed rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          background: rgba(20, 20, 20, 0.35);
          padding: 14px;
        }

        .cs-drop-inner {
          text-align: center;
          padding: 18px 10px;
        }

        .cs-drop-title {
          color: #e5e7eb;
          font-weight: 900;
          font-size: 14px;
        }

        .cs-drop-sub {
          color: #a3a3a3;
          font-size: 13px;
          margin-top: 4px;
        }

        .cs-file-btn {
          margin: 12px auto 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid #2a2a2a;
          background: rgba(20, 20, 20, 0.55);
          color: #e5e7eb;
          font-weight: 900;
          font-size: 13px;
          cursor: pointer;
        }

        .cs-file-btn:hover {
          border-color: #3a3a3a;
        }

        .cs-file-input {
          display: none;
        }

        .cs-drop-help {
          margin-top: 10px;
          color: #737373;
          font-size: 12px;
        }

        .cs-save {
          margin-top: 12px;
          width: 100%;
          height: 44px;
          border-radius: 12px;
        }

        .cs-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          margin: 12px 0;
        }

        .cs-kv {
          margin-top: 10px;
          display: grid;
          gap: 10px;
        }

        .cs-kv-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(20, 20, 20, 0.35);
          border-radius: 12px;
          padding: 10px 10px;
        }

        .cs-kv-left {
          min-width: 0;
        }

        .cs-kv-key {
          color: #a3a3a3;
          font-size: 12px;
          font-weight: 800;
        }

        .cs-kv-val {
          color: #e5e7eb;
          font-size: 13px;
          font-weight: 900;
          margin-top: 2px;
          word-break: break-word;
        }

        .cs-list {
          margin: 8px 0 0;
          padding-left: 18px;
          color: #d4d4d4;
          font-size: 13px;
          line-height: 1.5;
        }

        .cs-help {
          margin: 10px 0 0;
          color: #737373;
          font-size: 12px;
          line-height: 1.45;
        }

        .cs-error {
          margin-top: 10px;
          color: #f87171;
          font-size: 13px;
          font-weight: 700;
        }
      `}</style>
    </main>
  );
}
