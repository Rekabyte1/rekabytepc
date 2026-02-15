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
    // opcional: expira en 30 minutos
    const ts = Number(parsed?.ts ?? 0);
    if (!ts) return true;
    const ageMs = Date.now() - ts;
    return ageMs < 30 * 60 * 1000;
  } catch {
    return false;
  }
}

export function useCheckoutGuard(step: 1 | 2 | 3 | 4) {
  const router = useRouter();
  const pathname = usePathname();
  const { items } = useCart();
  const checkout = useCheckout() as any;
  const { datos, contacto, envio, pago } = checkout;

  useEffect(() => {
    // ✅ Excepción: si ya hay confirmación exitosa guardada, NO mandes al carrito.
    // Esto evita el "salto" a /carrito justo después de clearCart().
    const allowEmptyCartOnConfirm =
      step === 4 &&
      pathname === "/checkout/confirmacion" &&
      hasRecentOrderSuccess();

    // 1) Si no hay productos en el carrito, cualquier paso del checkout te manda al carrito
    //    (excepto la excepción de arriba).
    if (items.length === 0 && !allowEmptyCartOnConfirm) {
      if (pathname !== "/carrito") {
        router.replace("/carrito");
      }
      return;
    }

    // 2) Obtenemos "datos" efectivos: store o sessionStorage
    let datosEfectivos: any = datos ?? contacto ?? null;

    if (!datosEfectivos && typeof window !== "undefined") {
      try {
        const raw = window.sessionStorage.getItem("checkout_datos");
        if (raw) {
          datosEfectivos = JSON.parse(raw);
        }
      } catch {
        // ignore
      }
    }

    const hasDatos = !!datosEfectivos;
    const hasEnvio = !!envio;
    const hasPago = !!pago;

    // 3) Reglas de acceso:
    // Paso 2,3,4: si no hay datos, fuerzo a /checkout
    if (step >= 2 && !hasDatos) {
      if (pathname !== "/checkout") {
        router.replace("/checkout");
      }
      return;
    }

    // Paso 3,4: si no hay envío, fuerzo a /checkout/envio
    if (step >= 3 && (!hasDatos || !hasEnvio)) {
      if (pathname !== "/checkout/envio") {
        router.replace("/checkout/envio");
      }
      return;
    }

    // Paso 4: si no hay pago, fuerzo a /checkout/pago
    if (step >= 4 && (!hasDatos || !hasEnvio || !hasPago)) {
      if (pathname !== "/checkout/pago") {
        router.replace("/checkout/pago");
      }
      return;
    }
  }, [items.length, datos, contacto, envio, pago, step, pathname, router]);
}
