"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  image?: string;
  priceTransfer: number;
  priceCard: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  subtotalTransfer: number;
  subtotalCard: number;
  addItem: (
    item:
      | Omit<CartItem, "quantity">
      | (Omit<CartItem, "quantity" | "priceTransfer" | "priceCard"> & { price: number }),
    qty?: number
  ) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "rekabyte_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // hidrata
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  // persiste
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem: CartContextType["addItem"] = (raw, qty = 1) => {
    const item =
      "price" in raw
        ? { ...raw, priceTransfer: raw.price, priceCard: raw.price }
        : raw;

    setItems(prev => {
      const i = prev.findIndex(p => p.id === (item as any).id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], quantity: copy[i].quantity + qty };
        return copy;
      }
      return [...prev, { ...(item as Omit<CartItem, "quantity">), quantity: qty }];
    });
    setIsOpen(true);
  };

  const setQty: CartContextType["setQty"] = (id, qty) =>
    setItems(prev =>
      prev
        .map(p => (p.id === id ? { ...p, quantity: Math.max(1, qty) } : p))
        .filter(p => p.quantity > 0)
    );

  const removeItem = (id: string) => setItems(prev => prev.filter(p => p.id !== id));
  const clear = () => setItems([]);
  const toggleCart = () => setIsOpen(o => !o);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const count = useMemo(() => items.reduce((a, it) => a + it.quantity, 0), [items]);
  const subtotalTransfer = useMemo(
    () => items.reduce((a, it) => a + it.priceTransfer * it.quantity, 0),
    [items]
  );
  const subtotalCard = useMemo(
    () => items.reduce((a, it) => a + it.priceCard * it.quantity, 0),
    [items]
  );

  const value: CartContextType = {
    items,
    count,
    isOpen,
    subtotalTransfer,
    subtotalCard,
    addItem,
    setQty,
    removeItem,
    clear,
    toggleCart,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export const CLP = (n: number) =>
  n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
