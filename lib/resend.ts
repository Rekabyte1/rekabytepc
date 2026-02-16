// lib/resend.ts
import { Resend } from "resend";

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    throw new Error(`${name} no está configurado`);
  }
  return String(v).trim();
}

export function getResend() {
  const apiKey = requiredEnv("RESEND_API_KEY");
  return new Resend(apiKey);
}

export function getResendFrom() {
  // Ej: RekaByte <contacto@rekabyte.cl>
  return requiredEnv("RESEND_FROM");
}

export function statusLabel(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Pendiente de pago";
    case "PAID":
      return "Pagado / pago confirmado";
    case "PREPARING":
      return "Preparando pedido";
    case "SHIPPED":
      return "Despachado";
    case "DELIVERED":
      return "Entregado";
    case "COMPLETED":
      return "Completado / entregado";
    case "CANCELLED":
      return "Cancelado";
    default:
      return status;
  }
}

function orderNice(id: string) {
  const clean = String(id || "").trim();
  if (!clean) return "—";
  return "#" + clean.slice(-8).toUpperCase();
}

export async function sendOrderStatusUpdateEmail(args: {
  to: string;
  customerName?: string | null;
  orderId: string;
  newStatus: string;
  note?: string | null;
}) {
  const resend = getResend();
  const from = getResendFrom();

  const nice = orderNice(args.orderId);
  const sLabel = statusLabel(args.newStatus);
  const nameLine = args.customerName ? `Hola ${args.customerName},` : "Hola,";

  const note = String(args.note ?? "").trim();

  const subject = `Actualización de tu pedido ${nice} — ${sLabel}`;

  const text = [
    nameLine,
    "",
    `Tu pedido ${nice} fue actualizado.`,
    `Estado: ${sLabel}`,
    note ? "" : "",
    note ? `Mensaje: ${note}` : "",
    "",
    "Gracias por comprar en RekaByte.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5; color: #111;">
    <p style="margin:0 0 12px;">${escapeHtml(nameLine)}</p>
    <p style="margin:0 0 8px;"><strong>Actualización de tu pedido ${escapeHtml(
      nice
    )}</strong></p>
    <p style="margin:0 0 8px;">Estado: <strong>${escapeHtml(sLabel)}</strong></p>
    ${
      note
        ? `<div style="margin:12px 0; padding:12px; border:1px solid #eee; border-radius:10px; background:#fafafa;">
             <div style="font-size:12px; color:#666; margin-bottom:6px;">Mensaje</div>
             <div style="white-space:pre-wrap;">${escapeHtml(note)}</div>
           </div>`
        : ""
    }
    <p style="margin:14px 0 0; color:#555;">Gracias por comprar en RekaByte.</p>
  </div>
  `.trim();

  const res = await resend.emails.send({
    from,
    to: args.to,
    subject,
    text,
    html,
  });

  return res;
}

function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
