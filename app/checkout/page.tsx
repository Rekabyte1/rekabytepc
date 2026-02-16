// app/checkout/page.tsx
"use client";

import React, { FormEvent } from "react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { useCheckout } from "@/components/CheckoutStore";
import { useCheckoutGuard } from "@/components/useCheckoutGuard";

export default function Paso1Datos() {
  useCheckoutGuard(1);

  const router = useRouter();
  const checkout = useCheckout() as any;

  let persistedDatos: any = null;
  if (typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem("checkout_datos");
      if (raw) persistedDatos = JSON.parse(raw);
    } catch {}
  }

  const datos = checkout.datos ?? checkout.contacto ?? persistedDatos ?? null;

  const hasSetDatos = checkout && typeof checkout.setDatos === "function";
  const hasSetContacto = checkout && typeof checkout.setContacto === "function";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const nextDatos = {
      nombre: String(fd.get("nombre") || "").trim(),
      apellido: String(fd.get("apellido") || "").trim(),
      rut: String(fd.get("rut") || "").trim(), // ahora opcional
      telefono: String(fd.get("telefono") || "").trim(),
      email: String(fd.get("email") || "").trim(),
    };

    if (hasSetDatos) checkout.setDatos(nextDatos);
    else if (hasSetContacto) checkout.setContacto(nextDatos);

    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("checkout_datos", JSON.stringify(nextDatos));
      }
    } catch {}

    router.push("/checkout/envio");
  };

  return (
    <main className="rb-container checkout-step">
      <h1 className="cs-title">Tus datos</h1>

      <div className="cs-steps">
        <CheckoutSteps active={0} />
      </div>

      <div className="cs-grid">
        <section className="cs-card">
          <div className="cs-head">
            <div className="cs-accent" />
            <div>
              <h2 className="cs-card-title">Paso 1: Datos de contacto</h2>
              <p className="cs-card-sub">
                Usaremos estos datos para enviarte la confirmación y coordinar la entrega o retiro.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="cs-form">
            <div className="cs-two">
              <div className="cs-field">
                <label className="cs-label">Nombre</label>
                <input
                  name="nombre"
                  required
                  defaultValue={datos?.nombre ?? ""}
                  className="cs-input"
                  autoComplete="given-name"
                />
              </div>

              <div className="cs-field">
                <label className="cs-label">Apellido</label>
                <input
                  name="apellido"
                  required
                  defaultValue={datos?.apellido ?? ""}
                  className="cs-input"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="cs-two">
              <div className="cs-field">
                <label className="cs-label">RUT (opcional)</label>
                <input
                  name="rut"
                  defaultValue={datos?.rut ?? ""}
                  className="cs-input"
                  placeholder="12.345.678-9"
                  autoComplete="off"
                />
              </div>

              <div className="cs-field">
                <label className="cs-label">Teléfono</label>
                <input
                  name="telefono"
                  required
                  defaultValue={datos?.telefono ?? ""}
                  className="cs-input"
                  placeholder="+56 9 1234 5678"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="cs-field">
              <label className="cs-label">Correo electrónico</label>
              <input
                name="email"
                type="email"
                required
                defaultValue={datos?.email ?? ""}
                className="cs-input"
                placeholder="tucorreo@ejemplo.cl"
                autoComplete="email"
              />
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
