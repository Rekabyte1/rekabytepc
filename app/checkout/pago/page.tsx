// app/checkout/pago/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { PAYMENT_HELP, useCheckout } from "@/components/CheckoutStore";
import { useCart, CLP } from "@/components/CartContext";
import { useCheckoutGuard } from "@/components/useCheckoutGuard";

type MetodoPago = "transferencia" | "mercadopago" | "webpay";
type Documento = "boleta" | "factura";

export default function Paso3Pago() {
  useCheckoutGuard(3);

  const router = useRouter();
  const { subtotalTransfer, subtotalCard } = useCart();
  const { pago, setPago } = useCheckout();

  const initialMetodo = useMemo<MetodoPago>(() => {
    if (pago?.metodo) return pago.metodo as MetodoPago;
    return "transferencia";
  }, [pago?.metodo]);

  const [metodo, setMetodo] = useState<MetodoPago>(initialMetodo);
  const [doc, setDoc] = useState<Documento>((pago?.documento as Documento) ?? "boleta");

  const prices = useMemo(() => {
    return {
      transferencia: CLP(subtotalTransfer),
      mercadopago: CLP(subtotalCard),
      webpay: CLP(subtotalCard),
    } as const;
  }, [subtotalTransfer, subtotalCard]);

  return (
    <main className="rb-container checkout-step">
      <h1 className="cs-title">Medio de pago</h1>

      <div className="cs-steps">
        <CheckoutSteps active={2} />
      </div>

      <div className="cs-grid">
        {/* IZQUIERDA */}
        <section className="cs-card">
          <div className="cs-head">
            <div className="cs-accent" />
            <div>
              <h2 className="cs-card-title">Paso 3: Selecciona tu medio de pago</h2>
              <p className="cs-card-sub">
                Elige un método de pago y el tipo de documento que necesitas.
              </p>
            </div>
          </div>

          <form
            className="cs-form"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);

              const documento = doc;

              const factura =
                documento === "factura"
                  ? {
                      razonSocial: String(fd.get("razonSocial") || ""),
                      rut: String(fd.get("rutEmpresa") || ""),
                      giro: String(fd.get("giro") || ""),
                      telefono: String(fd.get("fono") || ""),
                      region: String(fd.get("region") || ""),
                      comuna: String(fd.get("comuna") || ""),
                      calle: String(fd.get("calle") || ""),
                      numero: String(fd.get("numero") || ""),
                      extra: String(fd.get("extra") || ""),
                    }
                  : null;

              setPago({ metodo, documento, factura });
              router.push("/checkout/confirmacion");
            }}
          >
            {/* Métodos */}
            <div className="cs-block">
              <div className="cs-block-title">Método de pago</div>

              <div className="cs-choice-grid">
                {(
                  [
                    ["transferencia", "Transferencia", prices.transferencia],
                    ["mercadopago", "Mercado Pago", prices.mercadopago],
                    ["webpay", "Webpay", prices.webpay],
                  ] as const
                ).map(([key, label, price]) => (
                  <label key={key} className={`cs-choice ${metodo === key ? "is-selected" : ""}`}>
                    <input
                      type="radio"
                      name="metodo"
                      value={key}
                      checked={metodo === key}
                      onChange={() => setMetodo(key)}
                    />
                    <div className="cs-choice-body">
                      <div className="cs-choice-title">{label}</div>
                      <div className="cs-choice-sub">{PAYMENT_HELP[key]}</div>
                    </div>
                    <div className="cs-price">{price}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Documento */}
            <div className="cs-block">
              <div className="cs-block-title">Documento</div>

              <div className="cs-tabs" role="tablist" aria-label="Documento">
                <button
                  type="button"
                  className={`cs-tab ${doc === "boleta" ? "is-active" : ""}`}
                  onClick={() => setDoc("boleta")}
                >
                  Boleta
                </button>
                <button
                  type="button"
                  className={`cs-tab ${doc === "factura" ? "is-active" : ""}`}
                  onClick={() => setDoc("factura")}
                >
                  Factura
                </button>
              </div>

              <p className="cs-help">
                Si necesitas factura, completa los datos tributarios y la dirección comercial.
              </p>

              {/* Datos de factura */}
              <div className={`cs-factura ${doc === "factura" ? "is-open" : ""}`}>
                <div className="cs-factura-inner">
                  <div className="cs-factura-title">Datos de factura</div>

                  <div className="cs-two">
                    <div className="cs-field">
                      <label className="cs-label">Razón social</label>
                      <input
                        name="razonSocial"
                        className="cs-input"
                        defaultValue={pago?.factura?.razonSocial ?? ""}
                        disabled={doc !== "factura"}
                        placeholder="Empresa SpA"
                      />
                    </div>
                    <div className="cs-field">
                      <label className="cs-label">RUT empresa</label>
                      <input
                        name="rutEmpresa"
                        className="cs-input"
                        defaultValue={pago?.factura?.rut ?? ""}
                        disabled={doc !== "factura"}
                        placeholder="12.345.678-9"
                      />
                    </div>
                  </div>

                  <div className="cs-two">
                    <div className="cs-field">
                      <label className="cs-label">Giro</label>
                      <input
                        name="giro"
                        className="cs-input"
                        defaultValue={pago?.factura?.giro ?? ""}
                        disabled={doc !== "factura"}
                        placeholder="Venta de computadores"
                      />
                    </div>
                    <div className="cs-field">
                      <label className="cs-label">Teléfono</label>
                      <input
                        name="fono"
                        className="cs-input"
                        defaultValue={pago?.factura?.telefono ?? ""}
                        disabled={doc !== "factura"}
                        placeholder="+56 9 1234 5678"
                      />
                    </div>
                  </div>

                  <div className="cs-two">
                    <div className="cs-field">
                      <label className="cs-label">Región</label>
                      <input
                        name="region"
                        className="cs-input"
                        defaultValue={pago?.factura?.region ?? ""}
                        disabled={doc !== "factura"}
                        placeholder="Región Metropolitana"
                      />
                    </div>
                    <div className="cs-field">
                      <label className="cs-label">Comuna</label>
                      <input
                        name="comuna"
                        className="cs-input"
                        defaultValue={pago?.factura?.comuna ?? ""}
                        disabled={doc !== "factura"}
                        placeholder="San Miguel"
                      />
                    </div>
                  </div>

                  <div className="cs-three">
                    <div className="cs-field">
                      <label className="cs-label">Calle</label>
                      <input
                        name="calle"
                        className="cs-input"
                        defaultValue={pago?.factura?.calle ?? ""}
                        disabled={doc !== "factura"}
                        placeholder="Real Audiencia"
                      />
                    </div>
                    <div className="cs-field">
                      <label className="cs-label">Número</label>
                      <input
                        name="numero"
                        className="cs-input"
                        defaultValue={pago?.factura?.numero ?? ""}
                        disabled={doc !== "factura"}
                        placeholder="1170"
                      />
                    </div>
                    <div className="cs-field">
                      <label className="cs-label">Depto / Oficina</label>
                      <input
                        name="extra"
                        className="cs-input"
                        defaultValue={pago?.factura?.extra ?? ""}
                        disabled={doc !== "factura"}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cs-actions">
              <button type="button" onClick={() => router.back()} className="rb-btn rb-btn--ghost">
                Volver
              </button>
              <button type="submit" className="rb-btn">
                Continuar
              </button>
            </div>
          </form>
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

        .cs-form {
          display: grid;
          gap: 14px;
        }

        .cs-block {
          border: 1px solid #262626;
          background: rgba(20, 20, 20, 0.35);
          border-radius: 14px;
          padding: 12px;
        }

        .cs-block-title {
          color: #e5e7eb;
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .cs-choice-grid {
          display: grid;
          gap: 10px;
        }

        .cs-choice {
          display: grid;
          grid-template-columns: 18px 1fr auto;
          gap: 12px;
          align-items: start;
          padding: 12px;
          border-radius: 14px;
          background: rgba(20, 20, 20, 0.55);
          border: 1px solid #262626;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .cs-choice:hover {
          border-color: #3a3a3a;
          background: rgba(20, 20, 20, 0.7);
        }

        .cs-choice.is-selected {
          border-color: rgba(182, 255, 46, 0.6);
          box-shadow: 0 0 0 1px rgba(182, 255, 46, 0.15) inset;
        }

        .cs-choice input[type="radio"] {
          margin-top: 2px;
          accent-color: #b6ff2e;
        }

        .cs-choice-title {
          color: #fff;
          font-weight: 800;
          font-size: 14px;
          line-height: 1.2;
        }

        .cs-choice-sub {
          margin-top: 6px;
          color: #a3a3a3;
          font-size: 13px;
          line-height: 1.45;
        }

        .cs-price {
          color: #fff;
          font-weight: 900;
          font-size: 13px;
          white-space: nowrap;
          padding-top: 2px;
        }

        .cs-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 8px;
        }

        .cs-tab {
          height: 42px;
          border-radius: 12px;
          border: 1px solid #262626;
          background: rgba(20, 20, 20, 0.55);
          color: #d4d4d4;
          font-weight: 900;
          font-size: 13px;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
        }

        .cs-tab:hover {
          border-color: #3a3a3a;
        }

        .cs-tab.is-active {
          border-color: rgba(182, 255, 46, 0.6);
          color: #b6ff2e;
          box-shadow: 0 0 0 1px rgba(182, 255, 46, 0.15) inset;
        }

        .cs-help {
          margin: 0;
          color: #737373;
          font-size: 12px;
          line-height: 1.45;
        }

        .cs-factura {
          margin-top: 10px;
          border-radius: 14px;
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.2s ease, opacity 0.2s ease;
        }

        .cs-factura.is-open {
          max-height: 800px;
          opacity: 1;
        }

        .cs-factura-inner {
          border: 1px solid #262626;
          background: rgba(20, 20, 20, 0.35);
          border-radius: 14px;
          padding: 12px;
        }

        .cs-factura-title {
          color: #e5e7eb;
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .cs-two {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 768px) {
          .cs-two {
            grid-template-columns: 1fr 1fr;
          }
        }

        .cs-three {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 900px) {
          .cs-three {
            grid-template-columns: 1.2fr 0.8fr 1fr;
          }
        }

        .cs-field {
          display: grid;
          gap: 6px;
        }

        .cs-label {
          color: #d4d4d4;
          font-size: 13px;
          font-weight: 700;
        }

        .cs-input {
          width: 100%;
          background: #141414;
          border: 1px solid #242424;
          color: #e5e7eb;
          border-radius: 12px;
          height: 44px;
          padding: 0 12px;
        }

        .cs-input::placeholder {
          color: #6b7280;
        }

        .cs-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cs-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 6px;
          flex-wrap: wrap;
        }

        .cs-actions .rb-btn {
          min-width: 160px;
        }

        .cs-summary {
          position: sticky;
          top: 1.5rem;
        }

        :global(.checkout-step input) {
          appearance: none;
          -webkit-appearance: none;
        }
      `}</style>
    </main>
  );
}
