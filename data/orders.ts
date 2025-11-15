// data/orders.ts

// Métodos que puede mandar la UI
export type PaymentUI = 'transferencia' | 'mercadopago' | 'webpay' | 'card' | 'transfer';
export type NormalizedPayment = 'card' | 'transfer';

// Ítem flexible (acepta tus claves actuales de CheckoutSummary)
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

export type CreateOrderInput = {
  items: RawOrderItem[];
  paymentMethod: PaymentUI; // lo que venga de la UI
  customer?: { name?: string; email?: string; phone?: string };
  shipping?: { tipo?: string; costoEnvio?: number };
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

  const normalized = normalizePayment(input.paymentMethod);

  // Normaliza ítems: id, título, qty y precio según método
  const items = (input.items ?? []).map((i) => {
    const normId = String(i.id ?? i.slug ?? '');
    const normTitle = String(i.title ?? i.name ?? '');
    const normQty = Number(i.qty ?? i.quantity ?? 0);

    const priceForMethod =
      normalized === 'transfer'
        ? i.priceTransfer ?? i.price
        : i.priceCard ?? i.price;

    const normPrice = Number(priceForMethod ?? 0);

    return {
      id: normId,
      title: normTitle,
      qty: normQty,
      price: normPrice,
      image: i.image,
      // conserva datos originales por si los quieres guardar:
      raw: i,
    };
  });

  return {
    id,
    number,
    status: 'pending' as const,
    paymentMethod: normalized, // 'card' | 'transfer'
    items,
    customer: input.customer ?? {},
    shipping: input.shipping ?? { tipo: 'retiro', costoEnvio: 0 },
    createdAt: new Date().toISOString(),
  };
}

export default { createOrder };
