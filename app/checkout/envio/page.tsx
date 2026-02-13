// app/checkout/envio/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { calcularEnvio, useCheckout } from "@/components/CheckoutStore";
import { useCheckoutGuard } from "@/components/useCheckoutGuard";

export default function Paso2Envio() {
  useCheckoutGuard(2);

  const router = useRouter();
  const { envio, setEnvio } = useCheckout();

  const initialTipo = useMemo<"pickup" | "delivery">(() => {
    if (!envio) return "pickup";
    return envio.tipo === "delivery" ? "delivery" : "pickup";
  }, [envio]);

  const [tipo, setTipo] = useState<"pickup" | "delivery">(initialTipo);

  return (
    <main className="rb-container checkout-step">
      <h1 className="cs-title">Forma de entrega</h1>

      <div className="cs-steps">
        <CheckoutSteps active={1} />
      </div>

      <div className="cs-grid">
        {/* IZQUIERDA */}
        <section className="cs-card">
          <div className="cs-head">
            <div className="cs-accent" />
            <div>
              <h2 className="cs-card-title">Paso 2: Entrega o retiro</h2>
              <p className="cs-card-sub">
                Elige retiro en tienda sin costo o despacho a domicilio.
              </p>
            </div>
          </div>

          <form
            className="cs-form"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              const nextTipo = String(fd.get("tipo")) as "pickup" | "delivery";

              if (nextTipo === "pickup") {
                setEnvio({ tipo: "pickup", costoEnvio: 0 });
              } else {
                const courier = (String(fd.get("courier")) || "chilexpress") as
                  | "chilexpress"
                  | "bluexpress";

                setEnvio({
                  tipo: "delivery",
                  costoEnvio: calcularEnvio(courier),
                  courier,
                  direccion: String(fd.get("direccion") || ""),
                  region: String(fd.get("region") || ""),
                  comuna: String(fd.get("comuna") || ""),
                });
              }

              router.push("/checkout/pago");
            }}
          >
            {/* Opciones */}
            <div className="cs-choice-grid">
              <label className={`cs-choice ${tipo === "pickup" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="tipo"
                  value="pickup"
                  checked={tipo === "pickup"}
                  onChange={() => setTipo("pickup")}
                />
                <div className="cs-choice-body">
                  <div className="cs-choice-title">Punto de retiro (gratis)</div>
                  <div className="cs-choice-sub">Real Audiencia 1170, San Miguel</div>
                </div>
                <div className="cs-pill">Gratis</div>
              </label>

              <label className={`cs-choice ${tipo === "delivery" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="tipo"
                  value="delivery"
                  checked={tipo === "delivery"}
                  onChange={() => setTipo("delivery")}
                />
                <div className="cs-choice-body">
                  <div className="cs-choice-title">Despacho a domicilio</div>
                  <div className="cs-choice-sub">Costo calculado según courier.</div>
                </div>
                <div className="cs-pill cs-pill--muted">Envío</div>
              </label>
            </div>

            {/* Dirección (solo si tipo=delivery) */}
            <div className={`cs-block ${tipo === "delivery" ? "" : "is-hidden"}`}>
              <div className="cs-block-title">Dirección de entrega</div>

              <div className="cs-two">
                <div className="cs-field">
                  <label className="cs-label">Calle y número</label>
                  <input
                    name="direccion"
                    className="cs-input"
                    defaultValue={(envio as any)?.direccion ?? ""}
                    placeholder="Ej: Real Audiencia 1170"
                    disabled={tipo !== "delivery"}
                  />
                </div>

                <div className="cs-field">
                  <label className="cs-label">Comuna</label>
                  <input
                    name="comuna"
                    className="cs-input"
                    defaultValue={(envio as any)?.comuna ?? ""}
                    placeholder="Ej: San Miguel"
                    disabled={tipo !== "delivery"}
                  />
                </div>
              </div>

              <div className="cs-two">
                <div className="cs-field">
                  <label className="cs-label">Región</label>
                  <input
                    name="region"
                    className="cs-input"
                    defaultValue={(envio as any)?.region ?? ""}
                    placeholder="Ej: Región Metropolitana"
                    disabled={tipo !== "delivery"}
                  />
                </div>

                <div className="cs-field">
                  <label className="cs-label">Courier</label>
                  <select
                    name="courier"
                    defaultValue={(envio as any)?.courier || "chilexpress"}
                    className="cs-select"
                    disabled={tipo !== "delivery"}
                  >
                    <option value="chilexpress">Chilexpress</option>
                    <option value="bluexpress">Bluexpress</option>
                  </select>
                </div>
              </div>

              <p className="cs-help">
                El valor mostrado es de referencia. Luego podemos integrar tarifas reales.
              </p>
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

        .cs-choice-grid {
          display: grid;
          gap: 10px;
        }

        .cs-choice {
          display: grid;
          grid-template-columns: 18px 1fr auto;
          gap: 12px;
          align-items: center;
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
          accent-color: #b6ff2e;
        }

        .cs-choice-title {
          color: #fff;
          font-weight: 800;
          font-size: 14px;
        }

        .cs-choice-sub {
          margin-top: 2px;
          color: #a3a3a3;
          font-size: 13px;
        }

        .cs-pill {
          border: 1px solid #2a2a2a;
          background: rgba(20, 20, 20, 0.6);
          color: #b6ff2e;
          font-weight: 800;
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .cs-pill--muted {
          color: #e5e7eb;
          opacity: 0.9;
        }

        .cs-block {
          border: 1px solid #262626;
          background: rgba(20, 20, 20, 0.35);
          border-radius: 14px;
          padding: 12px;
          transition: opacity 0.15s ease;
        }

        .cs-block.is-hidden {
          opacity: 0.4;
          pointer-events: none;
          filter: grayscale(0.2);
        }

        .cs-block-title {
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

        .cs-field {
          display: grid;
          gap: 6px;
        }

        .cs-label {
          color: #d4d4d4;
          font-size: 13px;
          font-weight: 700;
        }

        .cs-input,
        .cs-select {
          width: 100%;
          background: #141414;
          border: 1px solid #242424;
          color: #e5e7eb;
          border-radius: 12px;
          height: 44px;
          padding: 0 12px;
        }

        .cs-select {
          padding-right: 10px;
        }

        .cs-input::placeholder {
          color: #6b7280;
        }

        .cs-help {
          margin: 10px 0 0;
          color: #737373;
          font-size: 12px;
          line-height: 1.45;
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

        :global(.checkout-step input),
        :global(.checkout-step select) {
          appearance: none;
          -webkit-appearance: none;
        }

        :global(.checkout-step select) {
          appearance: auto;
          -webkit-appearance: auto;
        }
      `}</style>
    </main>
  );
}
