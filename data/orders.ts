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

// Subtotales/envío/total que puede mandar la UI
export type AmountsPayload = {
  subtotalTransfer?: number | string;
  subtotalCard?: number | string;
  // puede venir número (costo) o { tipo, costoEnvio }
  shipping?: number | string | { tipo?: string; costoEnvio?: number };
  total?: number | string;
};

export type CreateOrderInput = {
  items: RawOrderItem[];
  paymentMethod: PaymentUI;
  customer?: { name?: string; email?: string; phone?: string };
  shipping?: { tipo?: string; costoEnvio?: number };
  amounts?: AmountsPayload;
};

function normalizePayment(m: PaymentUI): NormalizedPayment {
  return m === 'transferencia' || m === 'transfer' ? 'transfer' : 'card';
}

// Código de retiro de 6 dígitos
function genPickupCode(): string {
  try {
    const arr = new Uint32Array(1);
    (crypto as any).getRandomValues?.(arr);
    return String(arr[0] % 1_000_000).padStart(6, '0');
  } catch {
    return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
  }
}

export function createOrder(input: CreateOrderInput) {
  const number = Date.now();
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto as any).randomUUID()
      : String(number);

  const method = normalizePayment(input.paymentMethod);

  // Normaliza ítems
  const items = (input.items ?? []).map((i) => {
    const normId = String(i.id ?? i.slug ?? '');
    const normTitle = String(i.title ?? i.name ?? '');
    const normQty = Number(i.qty ?? i.quantity ?? 0);

    const priceForMethod =
      method === 'transfer'
        ? i.priceTransfer ?? i.price
        : i.priceCard ?? i.price;

    const normPrice = Number(priceForMethod ?? 0);

    return {
      id: normId,
      title: normTitle,
      qty: normQty,
      price: normPrice,
      image: i.image,
      raw: i,
    };
  });

  // ---- amounts / shipping / total
  const a = input.amounts ?? {};

  const subtotalTransfer = Number(a.subtotalTransfer ?? 0);
  const subtotalCard = Number(a.subtotalCard ?? 0);

  const shippingObj =
    typeof a.shipping === 'object'
      ? {
          tipo: (a.shipping as any)?.tipo ?? 'envio',
          costoEnvio: Number((a.shipping as any)?.costoEnvio ?? 0),
        }
      : a.shipping !== undefined
      ? { tipo: 'envio', costoEnvio: Number(a.shipping) }
      : undefined;

  const baseSubtotal = method === 'transfer' ? subtotalTransfer : subtotalCard;
  const shipCost = shippingObj ? Number(shippingObj.costoEnvio ?? 0) : 0;

  const totalNumber =
    a.total !== undefined ? Number(a.total) : Number(baseSubtotal) + shipCost;

  const amounts = {
    subtotalTransfer,
    subtotalCard,
    shipping: shippingObj ?? { tipo: 'retiro', costoEnvio: 0 },
    total: totalNumber,
  };

  // Shipping top-level (si venía) prevalece; si no, usamos el normalizado
  const shipping =
    input.shipping ??
    (amounts.shipping as { tipo?: string; costoEnvio?: number });

  const customer = input.customer ?? {};

  // 👇 GENERAMOS pickupCode si es retiro
  const pickupCode =
    shipping?.tipo === 'retiro' ? genPickupCode() : undefined;

  const order = {
    id,
    number,
    status: 'pending' as const,
    paymentMethod: method, // 'card' | 'transfer'
    items,
    customer,
    shipping,
    amounts,
    pickupCode, // ← ahora existe
    createdAt: new Date().toISOString(),
  };

  // 🔗 Además de devolver el pedido "local", lo mandamos al backend /api/checkout
  if (typeof window !== 'undefined') {
    (async () => {
      try {
        await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: order.items.map((item) => ({
              // item.id aquí es el "slug o id" lógico del producto
              slug: item.id,
              quantity: item.qty,
            })),
            customer: {
              name: (order.customer as any)?.name ?? '',
              email: (order.customer as any)?.email ?? '',
              phone: (order.customer as any)?.phone,
            },
            deliveryType:
              (order.shipping as any)?.tipo === 'retiro'
                ? 'pickup'
                : 'shipping',
            // De momento, información adicional solo como nota
            notes: `UI order ${order.id} / method: ${order.paymentMethod}`,
          }),
        });
      } catch (err) {
        console.error('Error enviando pedido a /api/checkout:', err);
      }
    })();
  }

  // La UI sigue funcionando igual que antes
  return order;
}

export default { createOrder };
