"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "./CartContext";
import { useCheckout } from "./CheckoutStore";

function hasRecentOrderSuccess(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.sessionStorage.getItem("checkout_order_success");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const ts = Number(parsed?.ts ?? 0);
    if (!ts) return true;
    const ageMs = Date.now() - ts;
    return ageMs < 30 * 60 * 1000;
  } catch {
    return false;
  }
}

function readLegacyCustomer(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw1 = window.sessionStorage.getItem("checkout_customer_v1");
    if (raw1) return JSON.parse(raw1);
  } catch {}
  try {
    const raw2 = window.sessionStorage.getItem("checkout_datos");
    if (raw2) return JSON.parse(raw2);
  } catch {}
  return null;
}

export function useCheckoutGuard(step: 1 | 2 | 3 | 4) {
  const router = useRouter();
  const pathname = usePathname();
  const { items } = useCart();
  const checkout = useCheckout();

  useEffect(() => {
    const allowEmptyCartOnConfirm =
      step === 4 &&
      pathname === "/checkout/confirmacion" &&
      hasRecentOrderSuccess();

    // 0) Espera hidratación del store para no rebotar por timing
    if (!checkout.hydrated) {
      return;
    }

    // 1) Carrito vacío -> carrito (salvo confirmación exitosa)
    if (items.length === 0 && !allowEmptyCartOnConfirm) {
      if (pathname !== "/carrito") router.replace("/carrito");
      return;
    }

    // 2) Fuente de verdad: customer del store + fallback legacy
    let customer = checkout.customer ?? null;
    if (!customer) {
      const legacy = readLegacyCustomer();
      if (legacy) customer = legacy;
    }

    const hasCustomer = !!customer;
    const hasEnvio = !!checkout.envio;
    const hasPago = !!checkout.pago;

    // 3) Reglas por paso
    if (step >= 2 && !hasCustomer) {
      if (pathname !== "/checkout") router.replace("/checkout");
      return;
    }

    if (step >= 3 && (!hasCustomer || !hasEnvio)) {
      if (pathname !== "/checkout/envio") router.replace("/checkout/envio");
      return;
    }

    if (step >= 4 && (!hasCustomer || !hasEnvio || !hasPago)) {
      if (pathname !== "/checkout/pago") router.replace("/checkout/pago");
      return;
    }
  }, [
    items.length,
    checkout.customer,
    checkout.envio,
    checkout.pago,
    checkout.hydrated,
    step,
    pathname,
    router,
  ]);
}