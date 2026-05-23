// lib/stockAlerts.ts
import { prisma } from "@/lib/prisma";
import { getResend, getResendFrom } from "@/lib/resend";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://www.rekabyte.cl";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function toAbsoluteUrl(url: string | null | undefined) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return `${appUrl()}${trimmed}`;
  return `${appUrl()}/${trimmed}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function incrementProductStockAndDispatchIfRestocked(params: {
  tx: any;
  productId: string;
  quantity: number;
}) {
  const { tx, productId } = params;
  const quantity = Number(params.quantity || 0);

  if (!productId || quantity <= 0) {
    return { updated: false, restocked: false };
  }

  const prev = await tx.product.findUnique({
    where: { id: productId },
    select: { id: true, stock: true },
  });

  if (!prev || prev.stock === null) {
    return { updated: false, restocked: false };
  }

  const result = await tx.product.updateMany({
    where: { id: productId, stock: { not: null } },
    data: { stock: { increment: quantity } },
  });

  if (result.count <= 0) {
    return { updated: false, restocked: false };
  }

  const next = (prev.stock ?? 0) + quantity;
  const restocked = (prev.stock ?? 0) <= 0 && next >= 1;

  return { updated: true, restocked };
}

export async function dispatchStockAlertsForProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true, name: true, stock: true, imageUrl: true },
  });

  if (!product || (product.stock ?? 0) <= 0) return { sent: 0 };

  const pending = await prisma.stockAlert.findMany({
    where: { productId: product.id, status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  if (!pending.length) return { sent: 0 };

  const resend = getResend();
  const from = getResendFrom();

  const productUrl = `${appUrl()}/producto/${product.slug}`;
  const imageUrl = toAbsoluteUrl(product.imageUrl);
  const safeProductName = escapeHtml(product.name);

  let sent = 0;

  for (const alert of pending) {
    try {
      await resend.emails.send({
        from,
        to: alert.email,
        subject: `${product.name} volvió a stock | RekaByte`,
        html: `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tu producto volvió a stock</title>
  </head>
  <body style="margin:0;padding:0;background:#050505;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#050505;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;margin:0 auto;">
            <tr>
              <td
                style="
                  background:
                    radial-gradient(circle at 20% 0%, rgba(182,255,46,0.12), transparent 45%),
                    radial-gradient(circle at 100% 100%, rgba(182,255,46,0.08), transparent 45%),
                    #0b0b0b;
                  border:1px solid #1f2a0f;
                  border-radius:18px;
                  overflow:hidden;
                  box-shadow:0 12px 40px rgba(0,0,0,0.55);
                "
              >
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:24px 22px 8px 22px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1;color:#b6ff2e;letter-spacing:.22em;font-weight:700;text-transform:uppercase;">
                        RekaByte
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 22px 0 22px;">
                      <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:30px;line-height:1.15;font-weight:900;color:#ffffff;">
                        Tu producto volvió a stock
                      </h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:14px 22px 0 22px;">
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.4;color:#d4d4d4;font-weight:700;">
                        ${safeProductName}
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:10px 22px 0 22px;">
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#a3a3a3;">
                        Ya está disponible nuevamente en RekaByte. Si lo estabas esperando, este es el momento para asegurar tu compra.
                      </p>
                    </td>
                  </tr>

                  ${
                    imageUrl
                      ? `
                  <tr>
                    <td style="padding:18px 22px 0 22px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #263214;border-radius:14px;background:#090909;">
                        <tr>
                          <td align="center" style="padding:12px;">
                            <img
                              src="${imageUrl}"
                              alt="${safeProductName}"
                              width="520"
                              style="display:block;width:100%;max-width:520px;height:auto;border:0;outline:none;text-decoration:none;border-radius:10px;"
                            />
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  `
                      : ""
                  }

                  <tr>
                    <td align="center" style="padding:22px 22px 6px 22px;">
                      <a
                        href="${productUrl}"
                        target="_blank"
                        rel="noreferrer"
                        style="
                          display:inline-block;
                          font-family:Arial,Helvetica,sans-serif;
                          font-size:14px;
                          line-height:1;
                          font-weight:900;
                          color:#0a0a0a;
                          background:#b6ff2e;
                          border-radius:11px;
                          text-decoration:none;
                          padding:14px 24px;
                          box-shadow:0 8px 20px rgba(182,255,46,0.28);
                        "
                      >
                        Ver producto
                      </a>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:18px 22px 24px 22px;">
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.55;color:#7a7a7a;">
                        Recibiste este correo porque solicitaste una alerta de stock en RekaByte.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:12px 8px 0 8px;text-align:center;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#5f5f5f;">
                  © ${new Date().getFullYear()} RekaByte. Todos los derechos reservados.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
      });

      await prisma.stockAlert.update({
        where: { id: alert.id },
        data: { status: "SENT", sentAt: new Date(), lastError: null },
      });

      sent += 1;
    } catch (e: any) {
      await prisma.stockAlert.update({
        where: { id: alert.id },
        data: { lastError: String(e?.message ?? e ?? "Error enviando correo") },
      });
    }
  }

  return { sent };
}

export { normalizeEmail };