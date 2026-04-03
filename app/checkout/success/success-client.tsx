"use client";

import Link from "next/link";
import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";

function orderNumberNice(id: string) {
  const clean = String(id || "").trim();
  if (!clean) return "—";
  return "#" + clean.slice(-8).toUpperCase();
}

function CopyAllTransferButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);

  return (
    <button
      type="button"
      className={`cs-copy-all ${copied ? "is-copied" : ""}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        } catch {}
      }}
      aria-label="Copiar datos para la transferencia"
      title="Copiar datos para la transferencia"
    >
      {copied ? "Datos copiados" : "Copiar datos para la transferencia"}
      <style jsx>{`
        .cs-copy-all {
          margin-top: 12px;
          width: 100%;
          min-height: 44px;
          border-radius: 12px;
          border: 1px solid rgba(182, 255, 46, 0.3);
          background: rgba(182, 255, 46, 0.08);
          color: #b6ff2e;
          font-weight: 900;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease,
            color 0.15s ease;
        }

        .cs-copy-all:hover {
          background: rgba(182, 255, 46, 0.16);
          border-color: rgba(182, 255, 46, 0.55);
        }

        .cs-copy-all.is-copied {
          background: rgba(182, 255, 46, 0.18);
          border-color: rgba(182, 255, 46, 0.75);
          color: #d9ff8b;
        }
      `}</style>
    </button>
  );
}

export default function SuccessClient() {
  const sp = useSearchParams();

  const orderId = sp.get("orderId") ?? "";
  const pm = (sp.get("pm") ?? "").toLowerCase(); // transferencia | card
  const dt = (sp.get("dt") ?? "").toLowerCase(); // pickup | shipping

  const source = (sp.get("source") ?? "").toLowerCase(); // mercadopago
  const status = (sp.get("status") ?? "").toLowerCase(); // success | pending | failure
  const collectionStatus = (sp.get("collection_status") ?? "").toLowerCase(); // approved, pending, rejected
  const paymentId = sp.get("payment_id") ?? "";

  const isTransfer = pm === "transferencia";
  const isMercadoPago = source === "mercadopago" || (!isTransfer && pm !== "transferencia");

  const deliveryLabel =
    dt === "shipping" ? "Despacho a domicilio" : "Retiro en tienda";

  const niceId = useMemo(() => orderNumberNice(orderId), [orderId]);

  const transferData = useMemo(
    () => `Titular: Reka SpA
RUT: 20.420.860-0
Banco: Santander
Tipo de cuenta: Cuenta corriente
Número de cuenta: XXXXXXXX
Correo: contacto@rekabyte.cl`,
    []
  );

  const ui = useMemo(() => {
    if (isTransfer) {
      return {
        headline: "Pedido creado — Falta la transferencia",
        sub: "Te dejamos los datos para transferir. Reservaremos tu compra por 2 horas.",
        tone: "info" as const,
      };
    }

    if (isMercadoPago) {
      if (status === "success" || collectionStatus === "approved") {
        return {
          headline: "Pago acreditado — Pedido confirmado",
          sub: "Tu pago fue recibido correctamente. Te avisaremos cuando tu pedido avance de estado.",
          tone: "success" as const,
        };
      }

      if (
        status === "pending" ||
        collectionStatus === "pending" ||
        collectionStatus === "in_process"
      ) {
        return {
          headline: "Pedido creado — Pago en proceso",
          sub: "Tu pedido fue creado correctamente. Estamos esperando la confirmación final de Mercado Pago.",
          tone: "info" as const,
        };
      }

      if (
        status === "failure" ||
        collectionStatus === "rejected" ||
        collectionStatus === "cancelled"
      ) {
        return {
          headline: "Pago no completado",
          sub: "No se pudo confirmar el pago. Puedes intentarlo nuevamente desde tu cuenta o revisar tus compras.",
          tone: "error" as const,
        };
      }
    }

    return {
      headline: "Pedido creado",
      sub: "Tu pedido fue registrado correctamente.",
      tone: "info" as const,
    };
  }, [isTransfer, isMercadoPago, status, collectionStatus]);

  return (
    <main className="rb-container checkout-step">
      <h1 className="cs-title">¡Listo!</h1>

      <div className={`cs-card tone-${ui.tone}`}>
        <div className="cs-head">
          <div className="cs-accent" />
          <div>
            <h2 className="cs-card-title">{ui.headline}</h2>
            <p className="cs-card-sub">{ui.sub}</p>
          </div>
        </div>

        <div className="cs-kpi">
          <div className="cs-kpi-box">
            <div className="cs-kpi-label">Número de pedido</div>
            <div className="cs-kpi-value">{niceId}</div>
          </div>

          <div className="cs-kpi-box">
            <div className="cs-kpi-label">Entrega</div>
            <div className="cs-kpi-value">{deliveryLabel}</div>
          </div>

          {isMercadoPago ? (
            <div className="cs-kpi-box">
              <div className="cs-kpi-label">Estado del pago</div>
              <div className="cs-kpi-value">
                {collectionStatus === "approved"
                  ? "Pagado"
                  : collectionStatus === "pending" || collectionStatus === "in_process"
                  ? "En proceso"
                  : collectionStatus === "rejected" || collectionStatus === "cancelled"
                  ? "Rechazado"
                  : status === "success"
                  ? "Pagado"
                  : status === "pending"
                  ? "En proceso"
                  : status === "failure"
                  ? "No completado"
                  : "Procesando"}
              </div>
            </div>
          ) : null}

          {isMercadoPago && paymentId ? (
            <div className="cs-kpi-box">
              <div className="cs-kpi-label">ID de pago</div>
              <div className="cs-kpi-value">{paymentId}</div>
            </div>
          ) : null}
        </div>

        {isTransfer && (
          <div className="cs-panel">
            <div className="cs-panel-title">Datos para transferir</div>

            <div className="cs-transfer-box">
              <pre>{transferData}</pre>
            </div>

            <CopyAllTransferButton value={transferData} />

            <div className="cs-note">
              Tienes <span className="cs-strong">2 horas</span> para completar la transferencia.
              <br />
              Por restriccion bancaría, puedes realizar un abono del máximo permitido por tu banco, con esto, tu pedido quedará reservado.
              Envía el comprobante junto a tu número de pedido de la parte superior, respondiendo el correo de confirmación o a{" "}
              <span className="cs-strong">contacto@rekabyte.cl</span>.
            </div>
          </div>
        )}

        {isMercadoPago &&
          (status === "pending" ||
            collectionStatus === "pending" ||
            collectionStatus === "in_process") && (
            <div className="cs-panel">
              <div className="cs-panel-title">Pago en revisión</div>
              <div className="cs-note">
                Mercado Pago todavía no confirma el resultado final. Apenas se acredite, el pedido debería pasar a{" "}
                <span className="cs-strong">pagado</span> automáticamente en el panel administrador.
              </div>
            </div>
          )}

        {isMercadoPago &&
          (status === "failure" ||
            collectionStatus === "rejected" ||
            collectionStatus === "cancelled") && (
            <div className="cs-panel cs-panel-error">
              <div className="cs-panel-title">Pago no confirmado</div>
              <div className="cs-note">
                El pago no fue acreditado. Si el pedido quedó pendiente o cancelado, puedes volver a intentarlo desde{" "}
                <span className="cs-strong">Mis compras</span>.
              </div>
            </div>
          )}

        <div className="cs-actions">
          <Link href="/cuenta/panel?tab=compras" className="rb-btn">
            Ver mis compras
          </Link>
          <Link href="/" className="rb-btn rb-btn--ghost">
            Volver al inicio
          </Link>
        </div>
      </div>

      <style jsx>{`
        .checkout-step {
          padding-top: 24px;
          padding-bottom: 24px;
        }

        .cs-title {
          margin: 0 0 10px;
          font-size: 30px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .cs-card {
          background: #0d0d0d;
          border: 1px solid #262626;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
          max-width: 980px;
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
          height: 26px;
          border-radius: 999px;
          background: #b6ff2e;
          margin-top: 2px;
        }

        .tone-success .cs-accent {
          background: #22c55e;
        }

        .tone-error .cs-accent {
          background: #ef4444;
        }

        .cs-card-title {
          margin: 0;
          color: #fff;
          font-size: 18px;
          font-weight: 900;
        }

        .cs-card-sub {
          margin: 6px 0 0;
          color: #a3a3a3;
          font-size: 14px;
          line-height: 1.5;
        }

        .cs-kpi {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 10px;
        }

        @media (min-width: 900px) {
          .cs-kpi {
            grid-template-columns: 1fr 1fr;
          }
        }

        .cs-kpi-box {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(20, 20, 20, 0.35);
          border-radius: 14px;
          padding: 12px;
        }

        .cs-kpi-label {
          color: #a3a3a3;
          font-size: 12px;
          font-weight: 900;
        }

        .cs-kpi-value {
          color: #fff;
          font-size: 16px;
          font-weight: 900;
          margin-top: 4px;
          word-break: break-word;
        }

        .cs-panel {
          margin-top: 12px;
          border: 1px solid rgba(182, 255, 46, 0.25);
          background: rgba(182, 255, 46, 0.06);
          border-radius: 14px;
          padding: 12px;
        }

        .cs-panel-error {
          border-color: rgba(239, 68, 68, 0.25);
          background: rgba(239, 68, 68, 0.06);
        }

        .cs-panel-title {
          color: #e5e7eb;
          font-weight: 900;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .cs-transfer-box {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(20, 20, 20, 0.4);
          border-radius: 12px;
          padding: 12px;
          margin-top: 10px;
        }

        .cs-transfer-box pre {
          margin: 0;
          font-size: 12px;
          line-height: 1.65;
          color: #e5e7eb;
          font-weight: 700;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .cs-note {
          margin-top: 10px;
          color: #c4c4c4;
          font-size: 12px;
          line-height: 1.55;
        }

        .cs-strong {
          color: #fff;
          font-weight: 900;
        }

        .cs-actions {
          display: flex;
          gap: 10px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
      `}</style>
    </main>
  );
}