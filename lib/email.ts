// lib/email.ts
import { Resend } from "resend";

type PaymentMethod = "TRANSFER" | "CARD";
type ShippingMethod = "PICKUP" | "DELIVERY";

export type SendEmailResult =
  | {
      ok: true;
      skipped?: false;
      res: unknown; // respuesta del SDK (no dependemos de tipos internos)
    }
  | {
      ok: false;
      skipped?: boolean;
      reason?: string;
      error?: string;
      res?: unknown;
    };

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    throw new Error(`[email] Falta variable de entorno ${name}`);
  }
  return String(v).trim();
}

function getResend() {
  const apiKey = requireEnv("RESEND_API_KEY");
  return new Resend(apiKey);
}

function getFrom() {
  // Ej: RekaByte <contacto@rekabyte.cl>
  return requireEnv("RESEND_FROM");
}

function orderNumberNice(id: string) {
  const clean = String(id || "").trim();
  if (!clean) return "—";
  return "#" + clean.slice(-8).toUpperCase();
}

function esc(s: unknown) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function statusLabel(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Pendiente de pago";
    case "PAID":
      return "Pagado";
    case "PREPARING":
      return "Preparando pedido";
    case "SHIPPED":
      return "Despachado";
    case "DELIVERED":
      return "Entregado";
    case "COMPLETED":
      return "Completado";
    case "CANCELLED":
      return "Cancelado";
    default:
      return status;
  }
}

function paymentLabel(pm: string) {
  if (pm === "TRANSFER") return "Transferencia";
  if (pm === "CARD") return "Tarjeta";
  return pm;
}

function shippingLabel(sm: string) {
  if (sm === "PICKUP") return "Retiro en tienda";
  if (sm === "DELIVERY") return "Despacho a domicilio";
  return sm;
}

/** ✅ Email 1: confirmación de pedido creado (checkout) */
export async function sendOrderCreatedEmail(args: {
  to: string;
  customerName: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  total: number;
  subtotal: number;
  shippingCost: number;
  createdAtISO: string;
  items: { name: string; qty: number; unitPrice: number }[];
}): Promise<SendEmailResult> {
  try {
    const resend = getResend();
    const from = getFrom();

    const niceId = orderNumberNice(args.orderId);

    const itemsHtml = args.items
      .map(
        (it) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#e5e7eb;">${esc(
          it.name
        )}</td>
        <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#a3a3a3;text-align:right;">x${esc(
          it.qty
        )}</td>
        <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#e5e7eb;text-align:right;">$${esc(
          it.unitPrice
        )}</td>
      </tr>`
      )
      .join("");

    const html = `
  <div style="background:#0b0b0b;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;">
    <div style="max-width:720px;margin:0 auto;border:1px solid #262626;border-radius:16px;overflow:hidden;background:#0d0d0d;">
      <div style="padding:18px 18px 0 18px;">
        <div style="height:4px;width:48px;background:#b6ff2e;border-radius:999px;margin-bottom:12px;"></div>
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:900;">Confirmación de pedido ${esc(
          niceId
        )}</h1>
        <p style="margin:8px 0 0;color:#a3a3a3;font-size:14px;line-height:1.5;">
          Hola ${esc(args.customerName)}, tu pedido fue creado correctamente.
        </p>
      </div>

      <div style="padding:18px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div style="border:1px solid rgba(255,255,255,0.08);background:rgba(20,20,20,0.35);border-radius:14px;padding:12px;">
            <div style="color:#a3a3a3;font-size:12px;font-weight:900;">Pago</div>
            <div style="color:#fff;font-size:14px;font-weight:900;margin-top:4px;">${esc(
              paymentLabel(args.paymentMethod)
            )}</div>
          </div>
          <div style="border:1px solid rgba(255,255,255,0.08);background:rgba(20,20,20,0.35);border-radius:14px;padding:12px;">
            <div style="color:#a3a3a3;font-size:12px;font-weight:900;">Entrega</div>
            <div style="color:#fff;font-size:14px;font-weight:900;margin-top:4px;">${esc(
              shippingLabel(args.shippingMethod)
            )}</div>
          </div>
        </div>

        <div style="margin-top:14px;border:1px solid rgba(255,255,255,0.08);background:rgba(20,20,20,0.35);border-radius:14px;padding:12px;">
          <div style="color:#e5e7eb;font-weight:900;margin-bottom:8px;">Productos</div>
          <table style="width:100%;border-collapse:collapse;">
            ${itemsHtml}
          </table>
        </div>

        <div style="margin-top:14px;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;display:flex;justify-content:space-between;">
          <div style="color:#a3a3a3;font-size:13px;font-weight:800;">Total</div>
          <div style="color:#b6ff2e;font-size:16px;font-weight:900;">$${esc(
            args.total
          )}</div>
        </div>

        <p style="margin:12px 0 0;color:#737373;font-size:12px;line-height:1.5;">
          Si tienes dudas, responde este correo o escribe a contacto@rekabyte.cl
        </p>
      </div>
    </div>
  </div>`;

    const res = await resend.emails.send({
      from,
      to: args.to,
      subject: `RekaByte — Pedido ${niceId} creado`,
      html,
    });

    return { ok: true, res };
  } catch (err: any) {
    console.error("[email] sendOrderCreatedEmail error:", err);
    return {
      ok: false,
      error: String(err?.message ?? "sendOrderCreatedEmail failed"),
    };
  }
}

/** ✅ Email 2: actualización de estado (admin) */
export async function sendOrderStatusUpdateEmail(args: {
  to: string;
  customerName?: string | null;
  orderId: string;
  oldStatus?: string | null;
  newStatus: string;
  message?: string | null; // lo que escribes en el panel admin
}): Promise<SendEmailResult> {
  try {
    const resend = getResend();
    const from = getFrom();

    const niceId = orderNumberNice(args.orderId);
    const newLabel = statusLabel(args.newStatus);
    const oldLabel = args.oldStatus ? statusLabel(args.oldStatus) : null;

    const headline =
      args.newStatus === "PAID"
        ? "Pago confirmado"
        : args.newStatus === "CANCELLED"
        ? "Pedido cancelado"
        : "Actualización de tu pedido";

    const html = `
  <div style="background:#0b0b0b;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;">
    <div style="max-width:720px;margin:0 auto;border:1px solid #262626;border-radius:16px;overflow:hidden;background:#0d0d0d;">
      <div style="padding:18px 18px 0 18px;">
        <div style="height:4px;width:48px;background:#b6ff2e;border-radius:999px;margin-bottom:12px;"></div>
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:900;">${esc(
          headline
        )} — ${esc(niceId)}</h1>
        <p style="margin:8px 0 0;color:#a3a3a3;font-size:14px;line-height:1.5;">
          ${args.customerName ? `Hola ${esc(args.customerName)}. ` : ""}Te informamos un cambio en tu pedido.
        </p>
      </div>

      <div style="padding:18px;">
        <div style="border:1px solid rgba(255,255,255,0.08);background:rgba(20,20,20,0.35);border-radius:14px;padding:12px;">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
            <div>
              <div style="color:#a3a3a3;font-size:12px;font-weight:900;">Nuevo estado</div>
              <div style="color:#b6ff2e;font-size:16px;font-weight:900;margin-top:4px;">${esc(
                newLabel
              )}</div>
              ${
                oldLabel
                  ? `<div style="margin-top:6px;color:#737373;font-size:12px;">Anterior: ${esc(
                      oldLabel
                    )}</div>`
                  : ""
              }
            </div>
          </div>
        </div>

        ${
          args.message && String(args.message).trim()
            ? `<div style="margin-top:12px;border:1px solid rgba(182,255,46,0.25);background:rgba(182,255,46,0.06);border-radius:14px;padding:12px;">
                 <div style="color:#e5e7eb;font-weight:900;margin-bottom:6px;">Mensaje</div>
                 <div style="color:#d4d4d4;font-size:13px;line-height:1.55;white-space:pre-wrap;">${esc(
                   args.message
                 )}</div>
               </div>`
            : ""
        }

        <p style="margin:12px 0 0;color:#737373;font-size:12px;line-height:1.5;">
          Si necesitas ayuda, responde este correo o escribe a contacto@rekabyte.cl
        </p>
      </div>
    </div>
  </div>`;

    const res = await resend.emails.send({
      from,
      to: args.to,
      subject: `RekaByte — Actualización ${niceId}: ${newLabel}`,
      html,
    });

    return { ok: true, res };
  } catch (err: any) {
    console.error("[email] sendOrderStatusUpdateEmail error:", err);
    return {
      ok: false,
      error: String(err?.message ?? "sendOrderStatusUpdateEmail failed"),
    };
  }
}
