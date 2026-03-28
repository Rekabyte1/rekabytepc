// components/CartContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  image?: string;
  priceTransfer: number;
  priceCard: number;
  quantity: number;
  stock?: number | null;
  kind?: "PREBUILT_PC" | "UNIT_PRODUCT";
};

type AddCartInput =
  | Omit<CartItem, "quantity">
  | (Omit<CartItem, "quantity" | "priceTransfer" | "priceCard" | "slug"> & {
      slug?: string;
      price: number;
    });

type CartContextType = {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  subtotalTransfer: number;
  subtotalCard: number;
  addItem: (item: AddCartInput, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "rekabyte_cart_v1";

function clampQty(qty: number, stock?: number | null) {
  const normalized = Math.max(1, qty);

  if (typeof stock === "number") {
    return Math.min(normalized, Math.max(1, stock));
  }

  return normalized;
}

function normalizeStoredItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item: any) => {
      if (!item || typeof item !== "object") return null;

      const id = String(item.id ?? item.slug ?? "");
      if (!id) return null;

      const quantity = Math.max(1, Number(item.quantity ?? 1));

      return {
        id,
        slug: String(item.slug ?? id),
        name: String(item.name ?? "Producto"),
        image: item.image ? String(item.image) : undefined,
        priceTransfer: Number(item.priceTransfer ?? item.price ?? 0),
        priceCard: Number(item.priceCard ?? item.price ?? 0),
        quantity,
        stock:
          item.stock == null || Number.isNaN(Number(item.stock))
            ? null
            : Number(item.stock),
        kind:
          item.kind === "PREBUILT_PC" || item.kind === "UNIT_PRODUCT"
            ? item.kind
            : undefined,
      } satisfies CartItem;
    })
    .filter(Boolean) as CartItem[];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const normalized = normalizeStoredItems(parsed);
      setItems(normalized);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addItem: CartContextType["addItem"] = (raw, qty = 1) => {
    const item: Omit<CartItem, "quantity"> =
      "price" in raw
        ? {
            id: raw.id,
            slug: raw.slug ?? raw.id,
            name: raw.name,
            image: raw.image,
            priceTransfer: raw.price,
            priceCard: raw.price,
            stock: raw.stock ?? null,
            kind: raw.kind,
          }
        : raw;

    setItems((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === item.id);

      if (existingIndex >= 0) {
        const copy = [...prev];
        const existing = copy[existingIndex];

        const resolvedStock =
          item.stock != null ? item.stock : existing.stock ?? null;

        const nextQty = clampQty(existing.quantity + qty, resolvedStock);

        copy[existingIndex] = {
          ...existing,
          ...item,
          stock: resolvedStock,
          quantity: nextQty,
        };

        return copy;
      }

      return [
        ...prev,
        {
          ...item,
          quantity: clampQty(qty, item.stock),
        },
      ];
    });

    setIsOpen(true);
  };

  const setQty: CartContextType["setQty"] = (id, qty) =>
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        return {
          ...p,
          quantity: clampQty(qty, p.stock),
        };
      })
    );

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const clear = () => setItems([]);

  const toggleCart = () => setIsOpen((o) => !o);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const count = useMemo(
    () => items.reduce((a, it) => a + it.quantity, 0),
    [items]
  );

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
  n.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });