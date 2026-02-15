"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, CLP } from "@/components/CartContext";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function CheckoutOptionsPage() {
  const router = useRouter();
  const { subtotalTransfer, subtotalCard } = useCart();

  const { data: session, status } = useSession();

  const isAuthed = status === "authenticated";
  const userEmail = useMemo(() => session?.user?.email ?? "", [session]);

  // login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleGuest = () => {
    router.push("/checkout");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr(null);
    setLoginLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: loginEmail,
      password: loginPass,
    });

    setLoginLoading(false);

    if (res?.error) {
      setLoginErr("Correo o contraseña incorrectos.");
      return;
    }

    // ✅ ya logueado → checkout
    router.push("/checkout");
    router.refresh();
  };

  const handleContinueAuthed = () => {
    router.push("/checkout");
  };

  return (
    <main className="rb-container checkout-options">
      <h1 className="co-title">Elige cómo quieres comprar</h1>

      <div className="co-grid">
        {/* Login / Authed */}
        <div className="co-card">
          <div className="co-card-head">
            <div className="co-accent" />
            <div>
              <h2 className="co-card-title">
                {isAuthed ? "Continuar con tu cuenta" : "Inicia sesión"}
              </h2>
              <p className="co-card-sub">
                {isAuthed
                  ? "Estás logueado. Puedes continuar tu compra con tus datos guardados."
                  : "Entra con tu cuenta para asociar el pedido a tu usuario y ver tu historial de compras."}
              </p>
            </div>
          </div>

          {status === "loading" ? (
            <div className="co-loading">Cargando sesión…</div>
          ) : isAuthed ? (
            <div className="co-authed">
              <div className="co-authed-row">
                <span className="co-authed-label">Cuenta:</span>
                <span className="co-authed-value">{userEmail || "Usuario"}</span>
              </div>

              <button
                type="button"
                onClick={handleContinueAuthed}
                className="rb-btn co-cta"
              >
                Continuar al checkout
              </button>

              <div className="co-foot">
                ¿Quieres crear otra cuenta?{" "}
                <button
                  type="button"
                  className="co-link"
                  onClick={() => router.push("/cuenta/registro")}
                >
                  Ir a registro
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="co-form">
              <div className="co-field">
                <label className="co-label">Email</label>
                <input
                  type="email"
                  className="co-input"
                  placeholder="tucorreo@ejemplo.cl"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="co-field">
                <label className="co-label">Contraseña</label>
                <div className="co-input-wrap">
                  <input
                    type="password"
                    className="co-input co-input--pad"
                    placeholder="Mínimo 8 caracteres"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    required
                  />
                  <span className="co-eye">•••</span>
                </div>
                <div className="co-hint">Mínimo 8 caracteres</div>
              </div>

              {loginErr && (
                <div className="co-error">
                  {loginErr}
                </div>
              )}

              <button
                type="submit"
                className={`co-btn ${loginLoading ? "co-btn--disabled" : ""}`}
                disabled={loginLoading}
              >
                {loginLoading ? "Ingresando..." : "Iniciar sesión"}
              </button>

              <div className="co-divider">
                <span className="co-line" />
                <span className="co-divider-text">o</span>
                <span className="co-line" />
              </div>

              <div className="co-foot">
                ¿No estás registrado/a?{" "}
                <button
                  type="button"
                  className="co-link"
                  onClick={() => router.push("/cuenta/registro")}
                >
                  Crear cuenta
                </button>
              </div>

              <p className="co-note">
                * Si recién creaste la cuenta, vuelve aquí e inicia sesión para comprar logueado.
              </p>
            </form>
          )}
        </div>

        {/* Invitado */}
        <div className="co-card">
          <div className="co-card-head">
            <div className="co-accent" />
            <div>
              <h2 className="co-card-title">Compra como invitado/a</h2>
              <p className="co-card-sub">
                Puedes completar tu compra sin crear una cuenta. Si inicias sesión, el pedido quedará
                asociado a tu usuario y podrás verlo en “Mi cuenta”.
              </p>
            </div>
          </div>

          <div className="co-center">
            <div className="co-center-title">Compra en 4 pasos</div>
            <div className="co-center-sub">
              {isAuthed ? (
                <>
                  Estás logueado, pero si quieres puedes{" "}
                  <span className="co-strong">comprar como invitado/a</span> igual.
                </>
              ) : (
                <>
                  Más adelante puedes <span className="co-strong">crear una cuenta de cliente</span> y
                  comprar aún más rápido.
                </>
              )}
            </div>

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
          color: #e5e7eb;
        }

        .co-btn:hover {
          filter: brightness(1.05);
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

        .co-link {
          color: #b6ff2e;
          text-decoration: underline;
          text-underline-offset: 4px;
          background: transparent;
          border: 0;
          padding: 0;
          cursor: pointer;
          font-weight: 800;
        }

        .co-note {
          margin: 0;
          color: #737373;
          font-size: 12px;
        }

        .co-error {
          border: 1px solid rgba(239, 68, 68, 0.35);
          background: rgba(239, 68, 68, 0.12);
          color: rgba(254, 226, 226, 0.95);
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
        }

        .co-loading {
          color: #a3a3a3;
          font-size: 14px;
          padding: 10px 2px;
        }

        .co-authed {
          display: grid;
          gap: 12px;
        }

        .co-authed-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border: 1px solid #262626;
          background: rgba(20, 20, 20, 0.55);
          padding: 10px 12px;
          border-radius: 12px;
        }

        .co-authed-label {
          color: #a3a3a3;
          font-size: 13px;
          font-weight: 800;
        }

        .co-authed-value {
          color: #fff;
          font-size: 13px;
          font-weight: 900;
          word-break: break-word;
          text-align: right;
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
