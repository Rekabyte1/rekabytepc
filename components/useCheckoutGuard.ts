"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "./CartContext";
import { useCheckout } from "./CheckoutStore";

export function useCheckoutGuard(step: 1 | 2 | 3 | 4) {
  const router = useRouter();
  const pathname = usePathname();
  const { items } = useCart();

  const checkout = useCheckout() as any;
  const { datos, contacto, envio, pago } = checkout;

  useEffect(() => {
    // 1) Si no hay productos en el carrito, cualquier paso del checkout
    //    te manda al carrito.
    if (items.length === 0) {
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
        // ignoramos errores de parseo
      }
    }

    const hasDatos = !!datosEfectivos;
    const hasEnvio = !!envio;
    const hasPago = !!pago;

    // 3) Reglas de acceso:
    // - Paso 2 necesita datos
    // - Paso 3 necesita datos + envío
    // - Paso 4 necesita datos + envío + pago

    // Paso 2,3,4: si no hay datos, fuerzo a /checkout (Paso 1)
    if (step >= 2 && !hasDatos) {
      if (pathname !== "/checkout") {
        router.replace("/checkout");
      }
      return;
    }

    // Paso 3,4: si no hay envío, fuerzo a /checkout/envio (Paso 2)
    if (step >= 3 && (!hasDatos || !hasEnvio)) {
      if (pathname !== "/checkout/envio") {
        router.replace("/checkout/envio");
      }
      return;
    }

    // Paso 4: si no hay pago, fuerzo a /checkout/pago (Paso 3)
    if (step >= 4 && (!hasDatos || !hasEnvio || !hasPago)) {
      if (pathname !== "/checkout/pago") {
        router.replace("/checkout/pago");
      }
      return;
    }
  }, [items.length, datos, contacto, envio, pago, step, pathname, router]);
}
