'use client';

import Link from 'next/link';
import { useCart } from '../../components/CartContext';

export default function CarritoPage() {
  const { items, total, setQty, removeItem, clear } = useCart();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tu carrito</h1>

      {items.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <div className="font-semibold">{it.title}</div>
                  <div className="text-sm opacity-70">
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(it.price)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-16 border rounded p-1"
                    value={it.qty}
                    min={1}
                    onChange={(e) => setQty(it.id, Math.max(1, Number(e.target.value)))}
                  />
                  <button className="text-red-600" onClick={() => removeItem(it.id)}>
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <button className="border px-3 py-2 rounded" onClick={clear}>
              Vaciar carrito
            </button>
            <div className="text-xl font-bold">
              Total:{' '}
              {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(total)}
            </div>
          </div>

          <div className="mt-6">
            <Link href="/checkout">
              <button className="bg-green-600 text-white px-4 py-2 rounded">Ir a pagar</button>
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
