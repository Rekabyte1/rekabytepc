// data/orders.ts

// Métodos que puede mandar la UI
export type PaymentUI =
  | 'transferencia'
  | 'mercadopago'
  | 'webpay'
  | 'card'
  | 'transfer';
export type NormalizedPayment = 'card' | 'transfer';

// Ítem flexible (acepta claves usadas en CheckoutSummary)
export type RawOrderItem = {
  id?: string;
  slug?: string;

  title?: string;
  name?: string;

  qty?: number | string;
  quantity?: number | string;

  price?: number | string;          // precio genérico
  priceTransfer?: number | string;  // precio si paga transferencia
  priceCard?: number | string;      // precio si paga tarjeta

  image?: string;
  [key: string]: any;
};

// Payload opcional con subtotales y envío
export type AmountsPayload = {
  subtotalTransfer?: number | string;
  subtotalCard?: number | string;
  // Puede venir como número (costo) o como objeto { tipo, costoEnvio }
  shipping?: number | string | { tipo?: string; costoEnvio?: number };
};

export type CreateOrderInput = {
  items: RawOrderItem[];
  paymentMethod: PaymentUI; // lo que venga de la UI
  customer?: { name?: string; email?: string; phone?: string };
  // shipping también puede venir arriba (legacy)
  shipping?: { tipo?: string; costoEnvio?: number };
  // ← ahora aceptamos amounts desde la UI
  amounts?: AmountsPayload;
};

function normalizePayment(m: PaymentUI): NormalizedPayment {
  return m === 'transferencia' || m === 'transfer' ? 'transfer' : 'card';
}

export function createOrder(input: CreateOrderInput) {
  const number = Date.now();
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto as any).randomUUID()
      : String(number);

  const normalizedMethod = normalizePayment(input.paymentMethod);

  // Normaliza ítems: id, título, qty y precio según método
  const items = (input.items ?? []).map((i) => {
    const normId = String(i.id ?? i.slug ?? '');
    const normTitle = String(i.title ?? i.name ?? '');
    const normQty = Number(i.qty ?? i.quantity ?? 0);

    const priceForMethod =
      normalizedMethod === 'transfer'
        ? i.priceTransfer ?? i.price
        : i.priceCard ?? i.price;

    const normPrice = Number(priceForMethod ?? 0);

    return {
      id: normId,
      title: normTitle,
      qty: normQty,
      price: normPrice,
      image: i.image,
      raw: i, // conserva datos originales por si los quieres guardar
    };
  });

  // Normaliza amounts (si viene)
  const amounts = input.amounts
    ? {
        subtotalTransfer: Number((input.amounts as any).subtotalTransfer ?? 0),
        subtotalCard: Number((input.amounts as any).subtotalCard ?? 0),
        shipping:
          typeof (input.amounts as any).shipping === 'object'
            ? ((input.amounts as any).shipping as { tipo?: string; costoEnvio?: number })
            : { tipo: 'envio', costoEnvio: Number((input.amounts as any).shipping ?? 0) },
      }
    : undefined;

  // Shipping top-level (si no viene en amounts)
  const shipping =
    input.shipping ??
    (amounts?.shipping && typeof amounts.shipping === 'object'
      ? amounts.shipping
      : { tipo: 'retiro', costoEnvio: 0 });

  return {
    id,
    number,
    status: 'pending' as const,
    paymentMethod: normalizedMethod, // 'card' | 'transfer'
    items,
    customer: input.customer ?? {},
    shipping,
    amounts,
    createdAt: new Date().toISOString(),
  };
}

export default { createOrder };

