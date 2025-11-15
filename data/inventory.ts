// /data/inventory.ts
"use client";

/**
 * Inventario con RESERVAS (localStorage, prototipo):
 * - No se descuenta al “Agregar al carrito”.
 * - Se reserva al CONFIRMAR PEDIDO (paso 4).
 * - Transferencia => hold 24h. Gateway => hold 2h.
 * - Al marcar pagado, se descuenta del total (commit).
 */

type Dict<T> = Record<string, T>;

export type Reservation = {
  id: string;
  slug: string;
  qty: number;
  reason: "transfer" | "gateway" | "manual";
  orderId?: string;
  expiresAt: number; // 0 => no expira
  createdAt: number;
};

export type InventoryState = {
  total: Dict<number>;             // stock físico total
  reservations: Dict<Reservation>; // reservas activas
  nextResId: number;
};

const KEY = "rekabyte_inventory_v3";
const EVT = "inventory:update";

// Duraciones de reservas
export const HOLD_TRANSFER_MS = 24 * 60 * 60 * 1000; // 24h
export const HOLD_GATEWAY_MS = 2 * 60 * 60 * 1000;   // 2h

// Stock inicial editable
const DEFAULT_TOTAL: Dict<number> = {
  "oficina-8600g": 2,
  "entrada-ryzen7-rtx5060": 2,
  "media-ryzen9-rx9060xt": 2,
};

const now = () => Date.now();

function load(): InventoryState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as InventoryState;
  } catch {}
  const st: InventoryState = {
    total: { ...DEFAULT_TOTAL },
    reservations: {},
    nextResId: 1,
  };
  save(st);
  return st;
}

function save(st: InventoryState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(st));
    window.dispatchEvent(new CustomEvent(EVT));
  } catch {}
}

function cleanupExpired(st: InventoryState) {
  const t = now();
  let changed = false;
  for (const id of Object.keys(st.reservations)) {
    const r = st.reservations[id];
    if (r.expiresAt > 0 && r.expiresAt <= t) {
      delete st.reservations[id];
      changed = true;
    }
  }
  if (changed) save(st);
}

function activeReservationsFor(st: InventoryState, slug: string) {
  cleanupExpired(st);
  return Object.values(st.reservations).filter((r) => r.slug === slug);
}

function reservedQtyFor(st: InventoryState, slug: string) {
  return activeReservationsFor(st, slug).reduce((a, r) => a + r.qty, 0);
}

/** Stock disponible = total - reservados activos */
export function getStock(slug: string): number {
  const st = load();
  const total = st.total[slug] ?? 0;
  const reserved = reservedQtyFor(st, slug);
  return Math.max(0, total - reserved);
}

/** Total físico (incluye reservados) */
export function getTotal(slug: string): number {
  const st = load();
  return st.total[slug] ?? 0;
}

/** Snapshot completo (para panel admin/debug) */
export function getInventorySnapshot(): InventoryState {
  const st = load();
  cleanupExpired(st);
  return st;
}

/** Fija el total físico (admin) */
export function setTotal(slug: string, qty: number) {
  const st = load();
  st.total[slug] = Math.max(0, Math.floor(qty));
  save(st);
}

/** Suma al total físico (admin) */
export function addStock(slug: string, qty: number) {
  const st = load();
  st.total[slug] = Math.max(0, (st.total[slug] ?? 0) + Math.floor(qty));
  save(st);
}

/** Resta del total físico (admin) */
export function reduceStock(slug: string, qty: number) {
  const st = load();
  st.total[slug] = Math.max(0, (st.total[slug] ?? 0) - Math.floor(qty));
  save(st);
}

/** Crea una reserva si hay stock disponible. Devuelve id o null. */
export function reserveStock(params: {
  slug: string;
  qty: number;
  reason: Reservation["reason"];
  holdMs?: number; // 0 => no expira
  orderId?: string;
}): string | null {
  const st = load();
  cleanupExpired(st);

  const { slug, qty, reason, holdMs = 0, orderId } = params;
  if (qty <= 0) return null;

  const available = getStock(slug);
  if (available < qty) return null;

  const id = String(st.nextResId++);
  st.reservations[id] = {
    id,
    slug,
    qty,
    reason,
    orderId,
    createdAt: now(),
    expiresAt: holdMs > 0 ? now() + holdMs : 0,
  };
  save(st);
  return id;
}

/** Libera una reserva */
export function releaseReservation(reservationId: string) {
  const st = load();
  if (st.reservations[reservationId]) {
    delete st.reservations[reservationId];
    save(st);
  }
}

/** Compromete una reserva (descuenta del total y elimina la reserva) */
export function commitReservation(reservationId: string) {
  const st = load();
  const r = st.reservations[reservationId];
  if (!r) return;
  const cur = st.total[r.slug] ?? 0;
  st.total[r.slug] = Math.max(0, cur - r.qty);
  delete st.reservations[reservationId];
  save(st);
}

/** Acciones en lote por pedido */
export function releaseReservationsByOrder(orderId: string) {
  const st = load();
  for (const r of Object.values(st.reservations)) {
    if (r.orderId === orderId) delete st.reservations[r.id];
  }
  save(st);
}

export function commitReservationsByOrder(orderId: string) {
  const st = load();
  for (const r of Object.values(st.reservations)) {
    if (r.orderId === orderId) {
      const cur = st.total[r.slug] ?? 0;
      st.total[r.slug] = Math.max(0, cur - r.qty);
      delete st.reservations[r.id];
    }
  }
  save(st);
}

/** Suscripción a cambios (UI con stock en vivo) */
export function onInventoryChange(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(EVT as any, handler);
  return () => window.removeEventListener(EVT as any, handler);
}

/** Resetea todo (útil cuando cambias DEFAULT_TOTAL). Puedes pasar totales personalizados. */
export function resetInventory(newTotals?: Dict<number>) {
  const st: InventoryState = {
    total: newTotals ? { ...newTotals } : { ...DEFAULT_TOTAL },
    reservations: {},
    nextResId: 1,
  };
  save(st);
}
