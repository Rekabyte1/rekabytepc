"use client";

import { useCart } from "./CartContext";

export default function AddToCartButton({
  id, name, price, className = ""
}: { id: string; name: string; price: number; className?: string }) {
  const { addItem, openCart } = useCart();
  return (
    <button
      className={`rb-btn w-full ${className}`}
      onClick={() => { addItem({ id, name, price }); openCart(); }}
    >
      Añadir al carrito
    </button>
  );
}
