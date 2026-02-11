// app/checkout/page.tsx
"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { useCheckout } from "@/components/CheckoutStore";
import { useCheckoutGuard } from "@/components/useCheckoutGuard";

export default function Paso1Datos() {
  // Protegemos el paso 1 (solo revisa carrito)
  useCheckoutGuard(1);

  const router = useRouter();
  const checkout = useCheckout() as any;

  // ---- Datos iniciales: store + sessionStorage ----
  let persistedDatos: any = null;
  if (typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem("checkout_datos");
      if (raw) {
        persistedDatos = JSON.parse(raw);
      }
    } catch {
      // ignoramos errores de parseo
    }
  }

  const datos =
    checkout.datos ?? checkout.contacto ?? persistedDatos ?? null;

  // Detectamos si el store tiene setters, pero NO son obligatorios
  const hasSetDatos =
    checkout && typeof checkout.setDatos === "function";
  const hasSetContacto =
    checkout && typeof checkout.setContacto === "function";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const nextDatos = {
      nombre: String(fd.get("nombre") || "").trim(),
      apellido: String(fd.get("apellido") || "").trim(),
      rut: String(fd.get("rut") || "").trim(),
      telefono: String(fd.get("telefono") || "").trim(),
      email: String(fd.get("email") || "").trim(),
    };

    // 1) Guardar en el store SOLO si existe algún setter
    if (hasSetDatos) {
      checkout.setDatos(nextDatos);
    } else if (hasSetContacto) {
      checkout.setContacto(nextDatos);
    }

    // 2) Guardar SIEMPRE en sessionStorage
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "checkout_datos",
          JSON.stringify(nextDatos)
        );
      }
    } catch {
      // ignoramos errores de almacenamiento
    }

    // 3) Pasar al Paso 2 (envío)
    router.push("/checkout/envio");
  };

  return (
    <main className="checkout-page">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-2 text-2xl font-extrabold text-white">
          Tus datos
        </h1>

        {/* Paso 1 activo */}
        <CheckoutSteps active={0} />

        <div className="grid-two">
          {/* IZQUIERDA: formulario */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
            <form onSubmit={handleSubmit} className="grid gap-4">
              {/* Nombre */}
              <div className="space-y-1 text-sm">
                <label className="text-neutral-300">Nombre</label>
                <input
                  name="nombre"
                  required
                  defaultValue={datos?.nombre ?? ""}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                />
              </div>

              {/* Apellido */}
              <div className="space-y-1 text-sm">
                <label className="text-neutral-300">Apellido</label>
                <input
                  name="apellido"
                  required
                  defaultValue={datos?.apellido ?? ""}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                />
              </div>

              {/* RUT */}
              <div className="space-y-1 text-sm">
                <label className="text-neutral-300">RUT</label>
                <input
                  name="rut"
                  required
                  defaultValue={datos?.rut ?? ""}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-1 text-sm">
                <label className="text-neutral-300">Teléfono</label>
                <input
                  name="telefono"
                  required
                  defaultValue={datos?.telefono ?? ""}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                />
              </div>

              {/* Email */}
              <div className="space-y-1 text-sm">
                <label className="text-neutral-300">
                  Correo electrónico
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={datos?.email ?? ""}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="mt-4 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rb-btn--ghost rb-btn"
                >
                  Volver
                </button>
                <button type="submit" className="rb-btn">
                  Continuar
                </button>
              </div>
            </form>
          </section>

          {/* DERECHA: Resumen del carrito */}
          <CheckoutSummary />
        </div>
      </div>
    </main>
  );
}
