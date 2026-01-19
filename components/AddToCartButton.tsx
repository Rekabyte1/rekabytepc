// components/AddToCartButton.tsx
"use client";

import { useEffect, useState } from "react";
import { useCart } from "./CartContext";

type AddToCartButtonProps = {
  /**
   * IMPORTANTE:
   * Aquí va el slug del producto en la BD (Product.slug),
   * por ejemplo "oficina-8600g", "entrada-ryzen7-rtx5060", etc.
   */
  id: string;
  name: string;
  // Precio que ya estás mostrando en la tarjeta (normalmente transferencia)
  price: number;
  className?: string;
};

type ProductApiResponse = {
  ok: boolean;
  product?: {
    id: string;
    slug: string;
    name: string;
    price: number;
    stock: number | null;
    imageUrl?: string | null;
  } | null;
  error?: string;
};

export default function AddToCartButton({
  id,
  name,
  price,
  className = "",
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();

  const [stock, setStock] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(price);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        // Llama a /api/products/[slug] para leer stock y precio reales
        const res = await fetch(`/api/products/${id}`, { cache: "no-store" });

        if (!res.ok) {
          console.error(
            "Error leyendo /api/products/[slug]:",
            await res.text()
          );
          return;
        }

        const data = (await res.json()) as ProductApiResponse;
        const p = data.product;
        if (!p) return;

        if (!cancelled) {
          setStock(p.stock ?? 0);
          // Si quieres que el precio del carrito sea el que está en la BD:
          setCurrentPrice(p.price ?? price);
        }
      } catch (e) {
        console.error("Error al cargar producto", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, price]);

  const available = (stock ?? 0) > 0;
  const disabled = loading || !available;

  function handleClick() {
    if (disabled) return;

    addItem({
      id, // usamos el slug como id en el carrito
      name,
      price: currentPrice,
    });
    openCart();
  }

  let label: string;
  if (loading) label = "Cargando...";
  else if (!available) label = "Agotado";
  else label = "Agregar al carrito";

  return (
    <button
      className={`rb-btn w-full ${className} ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
      disabled={disabled}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}
