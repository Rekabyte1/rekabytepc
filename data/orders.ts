// data/orders.ts

// 🧾 Tipos mínimos (ajústalos cuando conectes la BD)
export type OrderItem = {
  id: string;
  title?: string;
  price: number;
  qty: number;
};

export type CreateOrderInput = {
  items: OrderItem[];
  paymentMethod: 'card' | 'transfer';
  customer?: { name?: string; email?: string; phone?: string };
};

// ✅ Exporta una función (módulo ESM)
export async function createOrder(input: CreateOrderInput) {
  // TODO: aquí luego llamas a Mongo / pasarela / API route
  const number = Date.now(); // número temporal de pedido
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto as any).randomUUID()
      : String(number);

  // Devuelve algo razonable para que el checkout siga funcionando
  return {
    id,
    number,
    status: 'pending' as const,
    ...input,
  };
}

// (Opcional) también export default por si alguna parte lo importa como default
export default { createOrder };
