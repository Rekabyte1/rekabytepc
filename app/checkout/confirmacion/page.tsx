"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { useCheckout } from "@/components/CheckoutStore";
import { useCart, CLP } from "@/components/CartContext";
import { useCheckoutGuard } from "@/components/useCheckoutGuard";
import { useSession } from "next-auth/react";

type Stage = "review" | "upload";
type CheckoutPaymentUI = "transferencia" | "webpay" | "mercadopago";

const CHECKOUT_TOKEN_KEY = "rb_checkout_token_v1";

function getOrCreateCheckoutToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.sessionStorage.getItem(CHECKOUT_TOKEN_KEY);
    if (existing && existing.trim()) return existing.trim();

    const token =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `rb_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    window.sessionStorage.setItem(CHECKOUT_TOKEN_KEY, token);
    return token;
  } catch {
    return `rb_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

function clearCheckoutToken() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(CHECKOUT_TOKEN_KEY);
  } catch {}
}

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
        } catch {}
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

function normalizeDeliveryType(tipo: any): "pickup" | "shipping" {
  const t = String(tipo ?? "").toLowerCase();
  if (t === "envio" || t === "shipping" || t === "delivery") return "shipping";
  return "pickup";
}

function readCheckoutDatosFromSessionStorage(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem("checkout_datos");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setOrderSuccessInSessionStorage(payload: {
  orderId?: string;
  paymentMethod?: string;
  deliveryType?: string;
}) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      "checkout_order_success",
      JSON.stringify({ ...payload, ts: Date.now() })
    );
  } catch {}
}

export default function Paso4Confirmacion() {
  useCheckoutGuard(4);

  const router = useRouter();
  const { data: session } = useSession();

  const checkout = useCheckout() as any;
  const { datos, contacto, pago, envio } = checkout;

  const { items, subtotalTransfer, subtotalCard, clear: clearCart } = useCart();

  const [stage, setStage] = useState<Stage>("review");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const [orderId, setOrderId] = useState<string>("");
  const [uiError, setUiError] = useState<string | null>(null);
  const [uiSuccess, setUiSuccess] = useState<string | null>(null);

  const datosEfectivos = useMemo(() => {
    return datos ?? contacto ?? readCheckoutDatosFromSessionStorage() ?? null;
  }, [datos, contacto]);

  const sessionName = (session?.user as any)?.name ?? "";
  const sessionEmail = (session?.user as any)?.email ?? "";

  const customerName = useMemo(() => {
    const nombre = String(datosEfectivos?.nombre ?? "").trim();
    const apellido = String(datosEfectivos?.apellido ?? "").trim();
    const full = `${nombre} ${apellido}`.trim();
    return (full || nombre || String(sessionName ?? "").trim() || "").trim();
  }, [datosEfectivos?.nombre, datosEfectivos?.apellido, sessionName]);

  const customerEmail = useMemo(() => {
    const e1 = String(datosEfectivos?.email ?? "").trim();
    const e2 = String(datosEfectivos?.correo ?? "").trim();
    const e3 = String(datosEfectivos?.mail ?? "").trim();
    const s = String(sessionEmail ?? "").trim();
    return (e1 || e2 || e3 || s || "").trim();
  }, [
    datosEfectivos?.email,
    datosEfectivos?.correo,
    datosEfectivos?.mail,
    sessionEmail,
  ]);

  const customerPhone = useMemo(() => {
    return String(datosEfectivos?.telefono ?? "").trim();
  }, [datosEfectivos?.telefono]);

  const payingWithTransfer =
    (pago?.metodo ?? "transferencia") === "transferencia";

  const selectedSubtotal = useMemo(
    () => (payingWithTransfer ? subtotalTransfer : subtotalCard),
    [payingWithTransfer, subtotalTransfer, subtotalCard]
  );

  const total = selectedSubtotal + (envio?.costoEnvio ?? 0);

  const deliveryType = useMemo(() => {
    return normalizeDeliveryType(envio?.tipo);
  }, [envio?.tipo]);

  const missing = useMemo(() => {
    const miss: string[] = [];
    if (!customerName) miss.push("nombre");
    if (!customerEmail) miss.push("email");
    if (deliveryType === "shipping") {
      if (!envio?.direccion) miss.push("dirección");
      if (!envio?.ciudad) miss.push("ciudad");
      if (!envio?.region) miss.push("región");
    }
    if (!created && !items?.length) miss.push("carrito");
    return miss;
  }, [
    customerName,
    customerEmail,
    deliveryType,
    envio?.direccion,
    envio?.ciudad,
    envio?.region,
    items?.length,
    created,
  ]);

  useEffect(() => {
    if (stage === "upload" && !orderId) {
      const id = "RB" + Date.now().toString().slice(-6);
      setOrderId(id);
    }
  }, [stage, orderId]);

  function orderNumberNice(id: string) {
    const clean = String(id || "").trim();
    if (!clean) return "—";
    return "#" + clean.slice(-8).toUpperCase();
  }

  async function handleConfirmPedido() {
    if (created || creating) return;

    setUiError(null);
    setUiSuccess(null);

    if (missing.length) {
      setUiError(
        `Falta completar: ${missing.join(", ")}. Revisa los pasos anteriores.`
      );
      return;
    }

    setCreating(true);

    try {
      const paymentMethod = (pago?.metodo ??
        "transferencia") as CheckoutPaymentUI;

      // ✅ IMPORTANTE: token estable por intento de compra
      const checkoutToken = getOrCreateCheckoutToken();

      const payload = {
        checkoutToken,
        items: items.map((it) => ({
          productSlug: it.id,
          quantity: it.quantity,
        })),
        customer: {
          name: customerName || "EMPTY",
          email: customerEmail || "EMPTY",
          phone: customerPhone || "",
        },
        deliveryType:
          deliveryType === "shipping"
            ? ("shipping" as const)
            : ("pickup" as const),
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
                fullName: customerName || undefined,
                phone: customerPhone || undefined,
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
        throw new Error(
          data?.error ??
            `No se pudo crear el pedido (HTTP ${res.status}). Intenta nuevamente.`
        );
      }

      const realOrderId = String(data?.orderId ?? data?.order?.id ?? "");
      const finalId = realOrderId || orderId;

      setOrderId(finalId);
      setCreated(true);

      setOrderSuccessInSessionStorage({
        orderId: finalId,
        paymentMethod,
        deliveryType,
      });

      // ✅ ya se creó el pedido: podemos limpiar token para que el siguiente intento sea otro
      clearCheckoutToken();

      // limpiar carrito
      clearCart();

      setUiSuccess(
        `Pedido creado correctamente (${orderNumberNice(
          finalId
        )}). Redirigiendo...`
      );

      const pm = payingWithTransfer ? "transferencia" : "card";
      const dt = deliveryType === "shipping" ? "shipping" : "pickup";
      router.replace(
        `/checkout/success?orderId=${encodeURIComponent(finalId)}&pm=${pm}&dt=${dt}`
      );
    } catch (err: any) {
      console.error("Error confirmando pedido:", err);
      setUiError(
        err?.message ?? "Ocurrió un error al crear el pedido. Intenta nuevamente."
      );
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

          {uiError && <div className="cs-msg cs-msg--error">{uiError}</div>}
          {uiSuccess && (
            <div className="cs-msg cs-msg--ok">
              {uiSuccess}
              <div className="cs-msg-actions">
                <Link href="/cuenta/panel?tab=compras" className="cs-msg-link">
                  Ver mis compras
                </Link>
                <Link href="/" className="cs-msg-link">
                  Volver al inicio
                </Link>
              </div>
            </div>
          )}

          {stage === "review" ? (
            <>
              <div className="cs-panels">
                <div className="cs-panel">
                  <div className="cs-panel-top">
                    <div>
                      <div className="cs-panel-title">Forma de entrega</div>
                      <div className="cs-panel-sub">
                        {deliveryType === "pickup" ? (
                          <>
                            Retiro en tienda (gratis)
                            <span className="cs-muted">
                              {" "}
                              · A pasos de metro Lo Vial, San Miguel
                            </span>
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

                <div className="cs-panel">
                  <div className="cs-panel-top">
                    <div>
                      <div className="cs-panel-title">Medio de pago</div>
                      <div className="cs-panel-sub">
                        {payingWithTransfer ? (
                          <>
                            Transferencia / Depósito bancario
                            <span className="cs-muted">
                              {" "}
                              · Documento: {pago?.documento ?? "boleta"}
                            </span>
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
                      Este método está en preparación. Si lo usas, el pedido igual se
                      creará.
                    </div>
                  )}
                </div>
              </div>

              <div className="cs-callout">
                <div className="cs-callout-title">Antes de confirmar</div>
                <p className="cs-callout-text">
                  Confirma para crear el pedido. Verás el resultado en una pantalla final
                  con instrucciones.
                </p>

                {missing.length ? (
                  <p className="cs-missing">
                    Falta completar:{" "}
                    <span className="cs-strong">{missing.join(", ")}</span>
                  </p>
                ) : null}

                <div className="cs-actions">
                  <button
                    type="button"
                    className="rb-btn"
                    onClick={handleConfirmPedido}
                    disabled={missing.length > 0 || creating || created}
                  >
                    {created
                      ? "Pedido creado"
                      : creating
                      ? "Confirmando..."
                      : "Confirmar pedido"}
                  </button>

                  <Link href="/" className="rb-btn rb-btn--ghost">
                    Volver al inicio
                  </Link>
                </div>
              </div>

              <div className="cs-total">
                <span>Total a pagar</span>
                <span className="cs-total-amount">{CLP(total)}</span>
              </div>
            </>
          ) : (
            <div className="cs-panel">
              <div className="cs-panel-title">Listo</div>
              <div className="cs-note">Redirigiendo a la pantalla final...</div>
            </div>
          )}
        </section>

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
        .cs-missing {
          margin: 10px 0 0;
          color: #fca5a5;
          font-size: 12px;
          font-weight: 800;
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
        .cs-msg {
          border-radius: 14px;
          padding: 12px;
          margin-bottom: 12px;
          font-size: 13px;
          line-height: 1.45;
          font-weight: 800;
        }
        .cs-msg--error {
          border: 1px solid rgba(248, 113, 113, 0.35);
          background: rgba(248, 113, 113, 0.08);
          color: #fecaca;
        }
        .cs-msg--ok {
          border: 1px solid rgba(182, 255, 46, 0.35);
          background: rgba(182, 255, 46, 0.08);
          color: #eaffc1;
        }
        .cs-msg-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .cs-msg-link {
          color: #b6ff2e;
          text-decoration: underline;
          font-weight: 900;
          font-size: 13px;
        }
      `}</style>
    </main>
  );
}
