"use client";

import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { calcularEnvio, useCheckout } from "@/components/CheckoutStore";
import { useCheckoutGuard } from "@/components/useCheckoutGuard";

export default function Paso2Envio() {
  useCheckoutGuard(2); // 👈 Protege este paso

  const router = useRouter();
  const { envio, setEnvio } = useCheckout();

  return (
    <main className="checkout-page">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-2 text-2xl font-extrabold text-white">Forma de entrega</h1>
        <CheckoutSteps active={1} />

        <div className="grid-two">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const tipo = String(fd.get("tipo"));
                if (tipo === "pickup") {
                  setEnvio({ tipo: "pickup", costoEnvio: 0 });
                } else {
                  const courier = (String(fd.get("courier")) || "chilexpress") as
                    | "chilexpress"
                    | "bluexpress";
                  setEnvio({
                    tipo: "delivery",
                    costoEnvio: calcularEnvio(courier),
                    courier,
                    direccion: String(fd.get("direccion") || ""),
                    region: String(fd.get("region") || ""),
                    comuna: String(fd.get("comuna") || ""),
                  });
                }
                router.push("/checkout/pago");
              }}
            >
              {/* Radios */}
              <div className="grid gap-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                  <input
                    type="radio"
                    name="tipo"
                    value="pickup"
                    defaultChecked={envio?.tipo === "pickup" || !envio}
                  />
                  <div>
                    <div className="font-semibold text-neutral-100">Punto de retiro (gratis)</div>
                    <div className="text-sm text-neutral-400">Real Audiencia 1170, San Miguel</div>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                  <input
                    type="radio"
                    name="tipo"
                    value="delivery"
                    defaultChecked={envio?.tipo === "delivery"}
                  />
                  <div>
                    <div className="font-semibold text-neutral-100">Despacho a domicilio</div>
                    <div className="text-sm text-neutral-400">Calcularemos el costo según courier.</div>
                  </div>
                </label>
              </div>

              {/* Address + courier (sólo si eligió delivery; no oculto para no complicar validación) */}
              <div className="rounded-xl border border-neutral-800 p-3">
                <div className="mb-2 text-sm font-semibold text-neutral-300">
                  Dirección de entrega (si elegiste despacho)
                </div>
                <div className="grid sm:grid-cols-2 sm:gap-3">
                  <input
                    name="direccion"
                    placeholder="Calle y número"
                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100"
                    defaultValue={(envio as any)?.direccion}
                  />
                  <input
                    name="comuna"
                    placeholder="Comuna"
                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100"
                    defaultValue={(envio as any)?.comuna}
                  />
                </div>
                <div className="grid sm:grid-cols-2 sm:gap-3">
                  <input
                    name="region"
                    placeholder="Región"
                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100"
                    defaultValue={(envio as any)?.region}
                  />
                  <select
                    name="courier"
                    defaultValue={(envio as any)?.courier || "chilexpress"}
                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100"
                  >
                    <option value="chilexpress">Chilexpress</option>
                    <option value="bluexpress">Bluexpress</option>
                  </select>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  (El valor mostrado es de referencia. Luego podemos integrar tarifas reales.)
                </p>
              </div>

              <div className="mt-2">
                <button className="rb-btn">Continuar</button>
              </div>
            </form>
          </section>

          <CheckoutSummary />
        </div>
      </div>
    </main>
  );
}
