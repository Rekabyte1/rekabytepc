"use client";

import { useCart } from "@/components/CartContext";

export default function CartCount({ className = "" }: { className?: string }) {
  const { count } = useCart();
  return <span className={`ml-1 text-lime-400/90 text-sm ${className}`}>({count})</span>;
}
