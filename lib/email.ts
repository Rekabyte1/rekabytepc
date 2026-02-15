// lib/email.ts
import { Resend } from "resend";

type OrderEmailItem = {
  name: string;
  qty: number;
  unitPrice: number;
};

type OrderEmailPayload = {
  to: string;
  customerName: string;
  orderId: string;
  paymentMethod: "TRANSFER" | "CARD";
  shippingMethod: "PICKUP" | "DELIVERY";
  total: number;
  subtotal: number;
  shippingCost: number;
  createdAtISO: string;
  items: OrderEmailItem[];
};

function moneyCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}

function shortOrder(orderId: string) {
  return orderId.slice(-8).toUpperCase();
}

function escapeHtml(s: string) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendOrderCreatedEmail(payload: OrderEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const replyTo = process.env.RESEND_REPLY_TO; // opcional pero recomendado

  if (!apiKey || !from) {
    console.warn("[email] Missing RESEND_API_KEY or RESEND_FROM");
    return { ok: false as const, skipped: true as const };
  }

  const resend = new Resend(apiKey);

  const orderNo = shortOrder(payload.orderId);
  const isTransfer = payload.paymentMethod === "TRANSFER";

  const subject = isTransfer
    ? `Pedido #${orderNo} creado — falta tu transferencia`
    : `Pedido #${orderNo} creado — confirmación`;

  const paymentCopy = isTransfer
    ? `Tu pedido fue creado correctamente. Para continuar, realiza la transferencia y espera la verificación del pago.`
    : `Tu pedido fue creado correctamente. El estado se actualizará cuando el proveedor confirme el pago.`;

  const shipCopy =
    payload.shippingMethod === "PICKUP"
      ? "Retiro en tienda"
      : "Despacho a domicilio";

  const itemsHtml = payload.items
    .map(
      (it) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">
            <div style="font-weight:700;">${escapeHtml(it.name)}</div>
            <div style="color:#666;font-size:12px;">${it.qty} × ${moneyCLP(
        it.unitPrice
      )}</div>
          </td>
          <td align="right" style="padding:8px 0;border-bottom:1px solid #eee;font-weight:700;">
            ${moneyCLP(it.unitPrice * it.qty)}
          </td>
        </tr>
      `
    )
    .join("");

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;line-height:1.4;">
    <div style="padding:18px 18px 0;">
      <h2 style="margin:0 0 6px;font-size:20px;">Gracias por tu compra, ${escapeHtml(
        payload.customerName || "cliente"
      )}.</h2>
      <p style="margin:0 0 12px;color:#333;">
        ${paymentCopy}
      </p>

      <div style="background:#f7f7f7;border:1px solid #eee;border-radius:12px;padding:14px;margin:12px 0;">
        <div style="font-size:12px;color:#666;">Número de pedido</div>
        <div style="font-size:18px;font-weight:800;">#${orderNo}</div>
        <div style="margin-top:10px;font-size:12px;color:#666;">
          Entrega: <b>${shipCopy}</b><br/>
          Pago: <b>${isTransfer ? "Transferencia" : "Tarjeta"}</b>
        </div>
      </div>

      <h3 style="margin:18px 0 10px;font-size:16px;">Resumen</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        ${itemsHtml}
        <tr>
          <td style="padding-top:12px;color:#666;">Subtotal</td>
          <td align="right" style="padding-top:12px;font-weight:700;">${moneyCLP(
            payload.subtotal
          )}</td>
        </tr>
        <tr>
          <td style="padding-top:6px;color:#666;">Envío</td>
          <td align="right" style="padding-top:6px;font-weight:700;">${
            payload.shippingCost > 0 ? moneyCLP(payload.shippingCost) : "-"
          }</td>
        </tr>
        <tr>
          <td style="padding-top:10px;font-size:14px;font-weight:900;">TOTAL</td>
          <td align="right" style="padding-top:10px;font-size:14px;font-weight:900;">${moneyCLP(
            payload.total
          )}</td>
        </tr>
      </table>

      ${
        isTransfer
          ? `
        <div style="margin:18px 0;padding:14px;border:1px solid #ffe58f;background:#fffbe6;border-radius:12px;">
          <div style="font-weight:800;margin-bottom:6px;">Transferencia</div>
          <div style="color:#333;font-size:13px;">
            Envía el comprobante respondiendo este correo o por WhatsApp. Reservaremos tu compra por un periodo limitado mientras se verifica el pago.
          </div>
        </div>
      `
          : ""
      }

      <p style="margin:18px 0 0;color:#666;font-size:12px;">
        Si tienes dudas, responde este correo y te ayudamos.
      </p>
      <p style="margin:8px 0 18px;color:#999;font-size:11px;">
        Pedido ID interno: ${escapeHtml(payload.orderId)}
      </p>
    </div>
  </div>
  `;

  const text = [
    `Gracias por tu compra, ${payload.customerName || "cliente"}.`,
    `Pedido: #${orderNo}`,
    `Entrega: ${shipCopy}`,
    `Pago: ${isTransfer ? "Transferencia" : "Tarjeta"}`,
    `Total: ${moneyCLP(payload.total)}`,
    "",
    isTransfer
      ? "Realiza la transferencia y envía el comprobante respondiendo este correo."
      : "Te avisaremos cuando el pago sea confirmado.",
  ].join("\n");

  const res = await resend.emails.send({
    from,
    to: payload.to,
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
  });

  return { ok: true as const, res };
}
