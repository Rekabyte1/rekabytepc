// data/orders.ts

// Métodos que puede enviar la UI
export type PaymentUI = 'transferencia' | 'mercadopago' | 'webpay' | 'card' | 'transfer';
// Método normalizado para backend/lógica
export type NormalizedPayment = 'card' | 'transfer';

export type OrderItem = {
  id: string;
  title?: string;
  price: number | string;
  qty: number | string;
};

export type CreateOrderInput = {
  items: OrderItem[];
  paymentMethod: PaymentUI; // ← acepta lo que manda tu UI
  customer?: { name?: string; email?: string; phone?: string };
  shipping?: { tipo?: string; costoEnvio?: number };
};

function normalizePayment(method: PaymentUI): NormalizedPayment {
  if (method === 'transferencia' || method === 'transfer') return 'transfer';
  // Cualquier otra opción de tarjeta se normaliza a 'card'
  return 'card'; // 'mercadopago' | 'webpay' | 'card'
}

export function createOrder(input: CreateOrderInput) {
  const number = Date.now();
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto as any).randomUUID()
      : String(number);

  const normalized = normalizePayment(input.paymentMethod);

  // Normaliza números
  const items = (input.items ?? []).map((i) => ({
    ...i,
    price: Number(i?.price ?? 0),
    qty: Number(i?.qty ?? 0),
  }));

  return {
    id,
    number,
    status: 'pending' as const,
    paymentMethod: normalized, // ← ya normalizado
    items,
    customer: input.customer ?? {},
    shipping: input.shipping ?? { tipo: 'retiro', costoEnvio: 0 },
  };
}

export default { createOrder };
