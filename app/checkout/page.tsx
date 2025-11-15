"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { useCart } from "@/components/CartContext";

export default function CheckoutDatos() {
  const router = useRouter();
  const { items } = useCart();

  return (
    // <- ESTA CLASE activa tus reglas en globals.css
    <main className="checkout-page">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-2 text-2xl font-extrabold text-white">Tus datos</h1>
        <CheckoutSteps active={0} />

        {/* <- ESTA CLASE activa la grilla 1fr / 360px que definiste en globals.css */}
        <div className="grid-two">
          {/* IZQUIERDA: formulario */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
            {items.length === 0 ? (
              <p className="text-neutral-300">
                Tu carrito está vacío. Agrega un producto para continuar.
              </p>
            ) : (
              <form
                className="grid gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  router.push("/checkout/envio");
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-neutral-400">Nombre</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400">Apellido</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-neutral-400">RUT</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400">Teléfono</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-neutral-400">Correo electrónico</label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100"
                    required
                  />
                </div>

                {/* Botones: Volver (izq) y Continuar (der) */}
                <div className="mt-4 flex items-center justify-between">
                  <Link
                    href="/"
                    className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900"
                  >
                    Volver
                  </Link>
                  <button className="rb-btn">Continuar</button>
                </div>
              </form>
            )}
          </section>

          {/* DERECHA: resumen compacto (es un <aside> dentro del componente) */}
          <CheckoutSummary />
        </div>
      </div>
    </main>
  );
}
