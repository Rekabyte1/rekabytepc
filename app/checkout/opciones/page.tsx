// app/checkout/opciones/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useCart, CLP } from "@/components/CartContext";

export default function CheckoutOptionsPage() {
  const router = useRouter();
  const { subtotalTransfer, subtotalCard } = useCart();

  const handleGuest = () => {
    router.push("/checkout");
  };

  const handleFakeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí más adelante pondremos el login real.
    alert("El inicio de sesión se activará cuando tengamos cuentas de usuario 😊");
  };

  return (
    <main className="min-h-[70vh] bg-black px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">
          Elige cómo quieres comprar
        </h1>

        {/* 2 columnas: login + invitado */}
        <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Columna izquierda: Inicia sesión */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-xl shadow-black/40">
            <h2 className="text-lg font-semibold text-lime-400">
              Inicia sesión
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              En el futuro podrás entrar con tu cuenta y tener tus datos
              guardados. Por ahora sólo está disponible la compra como invitado.
            </p>

            <form onSubmit={handleFakeLogin} className="mt-4 space-y-3">
              <div className="space-y-1 text-sm">
                <label className="text-neutral-300">Email</label>
                <input
                  type="email"
                  disabled
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-500"
                  placeholder="tucorreo@ejemplo.cl"
                />
              </div>

              <div className="space-y-1 text-sm">
                <label className="text-neutral-300">Contraseña</label>
                <input
                  type="password"
                  disabled
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-500"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <p className="mt-2 text-xs text-neutral-500">
                * El inicio de sesión real se activará cuando tengamos el sistema
                de cuentas.
              </p>

              <button
                type="submit"
                disabled
                className="mt-4 w-full rounded-xl bg-lime-500/30 px-4 py-2 text-sm font-semibold text-neutral-900 opacity-60"
              >
                Iniciar sesión
              </button>
            </form>
          </div>

          {/* Columna derecha: Compra como invitado */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-xl shadow-black/40">
            <h2 className="text-lg font-semibold text-lime-400">
              Compra como invitado/a
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              Puedes completar tu compra sin crear una cuenta. Más adelante, si
              quieres, podrás registrar una cuenta con tus datos de compra.
            </p>

            <ol className="mt-4 list-decimal space-y-1 pl-5 text-xs text-neutral-300">
              <li>Ingresa tus datos de contacto.</li>
              <li>Elige la forma de entrega.</li>
              <li>Selecciona el medio de pago.</li>
              <li>Revisa y confirma tu pedido.</li>
            </ol>

            {/* Resumen rápido del carrito (opcional, queda bonito) */}
            <div className="mt-5 text-xs text-neutral-400">
              <div className="flex items-center justify-between">
                <span>Total transferencia</span>
                <span className="font-semibold text-lime-400">
                  {CLP(subtotalTransfer)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>Total otros medios</span>
                <span className="font-semibold text-neutral-100">
                  {CLP(subtotalCard)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGuest}
              className="mt-6 w-full rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-black hover:bg-lime-300"
            >
              Comprar como invitado/a
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
