// app/checkout/opciones/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart, CLP } from "@/components/CartContext";

export default function CheckoutOptionsPage() {
  const router = useRouter();
  const { subtotalTransfer, subtotalCard } = useCart();

  const handleGuest = () => {
    router.push("/checkout");
  };

  const handleFakeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert("El inicio de sesión se activará cuando tengamos cuentas de usuario.");
  };

  return (
    <main className="rb-container checkout-options">
      <h1 className="co-title">Elige cómo quieres comprar</h1>

      <div className="co-grid">
        {/* Login */}
        <div className="co-card">
          <div className="co-card-head">
            <div className="co-accent" />
            <div>
              <h2 className="co-card-title">Inicia sesión</h2>
              <p className="co-card-sub">
                En el futuro podrás entrar con tu cuenta y tener tus datos guardados. Por ahora
                sólo está disponible la compra como invitado.
              </p>
            </div>
          </div>

          <form onSubmit={handleFakeLogin} className="co-form">
            <div className="co-field">
              <label className="co-label">Email</label>
              <input
                type="email"
                disabled
                className="co-input"
                placeholder="tucorreo@ejemplo.cl"
              />
            </div>

            <div className="co-field">
              <label className="co-label">Contraseña</label>
              <div className="co-input-wrap">
                <input
                  type="password"
                  disabled
                  className="co-input co-input--pad"
                  placeholder="Mínimo 8 caracteres"
                />
                <span className="co-eye">•••</span>
              </div>
              <div className="co-hint">Mínimo 8 caracteres</div>
            </div>

            <button type="submit" disabled className="co-btn co-btn--disabled">
              Iniciar sesión
            </button>

            <div className="co-divider">
              <span className="co-line" />
              <span className="co-divider-text">o continúa con</span>
              <span className="co-line" />
            </div>

            <button type="button" disabled className="co-btn co-btn--ghost co-btn--disabled">
              Continuar con Microsoft
            </button>

            <div className="co-foot">
              ¿No estás registrado/a? <span className="co-link-disabled">Crear cuenta</span>
            </div>

            <p className="co-note">
              * El inicio de sesión real se activará cuando tengamos el sistema de cuentas.
            </p>
          </form>
        </div>

        {/* Invitado */}
        <div className="co-card">
          <div className="co-card-head">
            <div className="co-accent" />
            <div>
              <h2 className="co-card-title">Compra como invitado/a</h2>
              <p className="co-card-sub">
                Puedes completar tu compra sin crear una cuenta. Más adelante, si quieres, podrás
                registrar una cuenta con tus datos de compra.
              </p>
            </div>
          </div>

          <div className="co-center">
            <div className="co-center-title">Compra en 4 pasos</div>
            <div className="co-center-sub">
              Más adelante puedes <span className="co-strong">crear una cuenta de cliente</span> y
              comprar aún más rápido.
            </div>

            {/* Usa tu estilo de botón rb-btn para que no se rompa */}
            <button type="button" onClick={handleGuest} className="rb-btn co-cta">
              Comprar como invitado/a
            </button>

            <div className="co-totals">
              <div className="co-row">
                <span>Total transferencia</span>
                <span className="co-price co-price--lime">{CLP(subtotalTransfer)}</span>
              </div>
              <div className="co-row">
                <span>Total otros medios</span>
                <span className="co-price">{CLP(subtotalCard)}</span>
              </div>
            </div>
          </div>

          <details className="co-details">
            <summary className="co-summary">Ver pasos del checkout</summary>
            <ol className="co-steps">
              <li>Ingresa tus datos de contacto.</li>
              <li>Elige la forma de entrega.</li>
              <li>Selecciona el medio de pago.</li>
              <li>Revisa y confirma tu pedido.</li>
            </ol>
          </details>
        </div>
      </div>

      <style jsx>{`
        .checkout-options {
          padding-top: 28px;
          padding-bottom: 28px;
        }

        .co-title {
          margin: 0 0 18px;
          font-size: 30px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .co-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }

        @media (min-width: 900px) {
          .co-grid {
            grid-template-columns: 1fr 1fr;
            gap: 22px;
            align-items: start;
          }
        }

        .co-card {
          background: #0d0d0d;
          border: 1px solid #262626;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
        }

        .co-card-head {
          display: grid;
          grid-template-columns: 10px 1fr;
          gap: 12px;
          align-items: start;
          margin-bottom: 16px;
        }

        .co-accent {
          width: 4px;
          height: 24px;
          border-radius: 999px;
          background: #b6ff2e;
          margin-top: 2px;
        }

        .co-card-title {
          margin: 0;
          color: #fff;
          font-size: 18px;
          font-weight: 800;
        }

        .co-card-sub {
          margin: 6px 0 0;
          color: #a3a3a3;
          font-size: 14px;
          line-height: 1.5;
        }

        .co-form {
          margin-top: 12px;
          display: grid;
          gap: 14px;
        }

        .co-field {
          display: grid;
          gap: 6px;
        }

        .co-label {
          color: #d4d4d4;
          font-size: 13px;
          font-weight: 700;
        }

        .co-input-wrap {
          position: relative;
        }

        .co-input {
          width: 100%;
          background: #141414;
          border: 1px solid #242424;
          color: #e5e7eb;
          border-radius: 12px;
          height: 44px;
          padding: 0 12px;
        }

        .co-input::placeholder {
          color: #6b7280;
        }

        .co-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .co-input--pad {
          padding-right: 44px;
        }

        .co-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #737373;
          font-size: 12px;
          user-select: none;
        }

        .co-hint {
          color: #737373;
          font-size: 12px;
        }

        .co-btn {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          border: 1px solid #2a2a2a;
          background: #181818;
          color: #d4d4d4;
        }

        .co-btn--ghost {
          background: transparent;
          border: 1px solid #2a2a2a;
          color: #a3a3a3;
        }

        .co-btn--disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .co-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 2px;
        }

        .co-line {
          height: 1px;
          background: #262626;
          flex: 1;
        }

        .co-divider-text {
          color: #737373;
          font-size: 12px;
          white-space: nowrap;
        }

        .co-foot {
          text-align: center;
          color: #a3a3a3;
          font-size: 14px;
        }

        .co-link-disabled {
          color: #b6ff2e;
          opacity: 0.6;
          text-decoration: underline;
          text-underline-offset: 4px;
          cursor: not-allowed;
        }

        .co-note {
          margin: 0;
          color: #737373;
          font-size: 12px;
        }

        .co-center {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 10px;
          padding: 10px 0 6px;
        }

        .co-center-title {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
        }

        .co-center-sub {
          max-width: 360px;
          color: #a3a3a3;
          font-size: 14px;
          line-height: 1.5;
        }

        .co-strong {
          color: #b6ff2e;
          font-weight: 800;
        }

        .co-cta {
          width: min(360px, 100%);
          height: 44px;
          border-radius: 12px;
          margin-top: 10px;
        }

        .co-totals {
          width: min(360px, 100%);
          margin-top: 10px;
          border: 1px solid #262626;
          border-radius: 12px;
          padding: 12px 12px;
          background: rgba(20, 20, 20, 0.55);
        }

        .co-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 13px;
          color: #d4d4d4;
        }

        .co-row + .co-row {
          margin-top: 8px;
        }

        .co-price {
          font-weight: 900;
          color: #fff;
        }

        .co-price--lime {
          color: #b6ff2e;
        }

        .co-details {
          margin-top: 14px;
          border: 1px solid #262626;
          border-radius: 12px;
          background: rgba(20, 20, 20, 0.35);
          padding: 10px 12px;
        }

        .co-summary {
          cursor: pointer;
          color: #e5e7eb;
          font-weight: 800;
          font-size: 14px;
        }

        .co-steps {
          margin: 10px 0 0;
          padding-left: 18px;
          color: #d4d4d4;
          font-size: 14px;
          line-height: 1.55;
        }
      `}</style>
    </main>
  );
}
