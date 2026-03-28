// components/AddToCartButton.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";

type AddToCartButtonProps = {
  /**
   * Siempre usa el Product.slug real de la BD
   */
  slug: string;
  name?: string;
  className?: string;
  qty?: number;
  mode?: "add" | "buy_now";
  children?: React.ReactNode;
};

type ProductApiResponse = {
  ok: boolean;
  product?:
    | {
        id: string;
        slug: string;
        name: string;
        price: number;
        priceCard: number;
        priceTransfer: number;
        stock: number | null;
        imageUrl?: string | null;
        kind?: "PREBUILT_PC" | "UNIT_PRODUCT";
      }
    | null;
  error?: string;
};

export default function AddToCartButton({
  slug,
  name,
  className = "",
  qty = 1,
  mode = "add",
  children,
}: AddToCartButtonProps) {
  const router = useRouter();
  const { addItem, items, openCart } = useCart();

  const [product, setProduct] = useState<ProductApiResponse["product"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch(`/api/products/${slug}`, { cache: "no-store" });

        if (!res.ok) {
          console.error("Error leyendo /api/products/[slug]:", await res.text());
          return;
        }

        const data = (await res.json()) as ProductApiResponse;

        if (!cancelled) {
          setProduct(data.product ?? null);
        }
      } catch (e) {
        console.error("Error al cargar producto para carrito", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const stock = product?.stock ?? 0;
  const available = stock > 0;
  const disabled = loading || !product || !available;

  function buildCartPayload() {
    if (!product) return null;

    return {
      id: product.slug,
      slug: product.slug,
      name: product.name || name || product.slug,
      image: product.imageUrl ?? undefined,
      priceTransfer: product.priceTransfer ?? product.price ?? 0,
      priceCard: product.priceCard ?? product.price ?? 0,
      stock: product.stock ?? null,
      kind: product.kind,
    };
  }

  function handleAdd() {
    if (disabled) return;

    const payload = buildCartPayload();
    if (!payload) return;

    addItem(payload, qty);
    openCart();
  }

  function handleBuyNow() {
    if (disabled) return;

    const payload = buildCartPayload();
    if (!payload) return;

    const exists = items.some((it) => it.id === payload.id);

    if (!exists) {
      addItem(payload, qty);
    }

    router.push("/checkout/opciones");
  }

  function handleClick() {
    if (mode === "buy_now") {
      handleBuyNow();
      return;
    }

    handleAdd();
  }

  let label = "Agregar al carrito";
  if (mode === "buy_now") label = "Comprar ahora";
  if (loading) label = "Cargando...";
  else if (!available) label = "Agotado";

  return (
    <button
      type="button"
      className={`rb-btn w-full ${className} ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
      disabled={disabled}
      onClick={handleClick}
    >
      {children ?? label}
    </button>
  );
}