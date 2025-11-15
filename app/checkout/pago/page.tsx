"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { PAYMENT_HELP, useCheckout } from "@/components/CheckoutStore";
import { useCart, CLP } from "@/components/CartContext";

export default function Paso3Pago() {
  const router = useRouter();
  const { subtotalTransfer, subtotalCard } = useCart();
  const { pago, setPago } = useCheckout();

  const [doc, setDoc] = useState<"boleta" | "factura">(pago?.documento ?? "boleta");

  return (
    <main className="checkout-page">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-2 text-2xl font-extrabold text-white">Medio de pago</h1>
        <CheckoutSteps active={2} />

        <div className="grid-two">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
            <form
              className="grid gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const metodo = String(fd.get("metodo")) as
                  | "transferencia"
                  | "mercadopago"
                  | "webpay";
                const documento = doc;

                const factura =
                  documento === "factura"
                    ? {
                        razonSocial: String(fd.get("razonSocial") || ""),
                        rut: String(fd.get("rutEmpresa") || ""),
                        giro: String(fd.get("giro") || ""),
                        telefono: String(fd.get("fono") || ""),
                        region: String(fd.get("region") || ""),
                        comuna: String(fd.get("comuna") || ""),
                        calle: String(fd.get("calle") || ""),
                        numero: String(fd.get("numero") || ""),
                        extra: String(fd.get("extra") || ""),
                      }
                    : null;

                setPago({ metodo, documento, factura });
                router.push("/checkout/confirmacion"); // <- IMPORTANTE (evita 404)
              }}
            >
              {/* Métodos */}
              <div className="grid gap-3">
                {(
                  [
                    ["transferencia", CLP(subtotalTransfer)],
                    ["mercadopago", CLP(subtotalCard)],
                    ["webpay", CLP(subtotalCard)],
                  ] as const
                ).map(([key, price]) => (
                  <label
                    key={key}
                    className="block cursor-pointer rounded-xl border border-neutral-800 bg-neutral-950 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="metodo"
                          value={key}
                          defaultChecked={
                            pago?.metodo === key || (!pago && key === "transferencia")
                          }
                        />
                        <span className="font-semibold capitalize text-neutral-100">
                          {key === "mercadopago" ? "Mercado Pago" : key}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-neutral-100">
                        {price}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-neutral-400">
                      {PAYMENT_HELP[key]}
                    </p>
                  </label>
                ))}
              </div>

              {/* Documento */}
              <div>
                <div className="mb-2 text-sm font-semibold text-neutral-300">
                  Boleta o factura
                </div>
                <div className="flex gap-2">
                  <label className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2">
                    <input
                      type="radio"
                      name="documento"
                      value="boleta"
                      checked={doc === "boleta"}
                      onChange={() => setDoc("boleta")}
                    />
                    <span>Boleta</span>
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2">
                    <input
                      type="radio"
                      name="documento"
                      value="factura"
                      checked={doc === "factura"}
                      onChange={() => setDoc("factura")}
                    />
                    <span>Factura</span>
                  </label>
                </div>
              </div>

              {/* Datos de factura — SOLO si se elige factura */}
              {doc === "factura" && (
                <fieldset className="rounded-xl border border-neutral-800 p-3">
                  <legend className="px-1 text-sm text-neutral-400">
                    Datos de factura
                  </legend>

                  <div className="grid sm:grid-cols-2 sm:gap-3">
                    <input name="razonSocial" placeholder="Razón social" className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100" defaultValue={pago?.factura?.razonSocial} />
                    <input name="rutEmpresa" placeholder="RUT empresa" className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100" defaultValue={pago?.factura?.rut} />
                  </div>
                  <div className="grid sm:grid-cols-2 sm:gap-3">
                    <input name="giro" placeholder="Giro del negocio" className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100" defaultValue={pago?.factura?.giro} />
                    <input name="fono" placeholder="Teléfono" className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100" defaultValue={pago?.factura?.telefono} />
                  </div>
                  <div className="grid sm:grid-cols-2 sm:gap-3">
                    <input name="region" placeholder="Región" className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100" defaultValue={pago?.factura?.region} />
                    <input name="comuna" placeholder="Comuna" className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100" defaultValue={pago?.factura?.comuna} />
                  </div>
                  <div className="grid sm:grid-cols-3 sm:gap-3">
                    <input name="calle" placeholder="Calle" className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100" defaultValue={pago?.factura?.calle} />
                    <input name="numero" placeholder="Número" className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100" defaultValue={pago?.factura?.numero} />
                    <input name="extra" placeholder="Depto / Oficina (opcional)" className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-100" defaultValue={pago?.factura?.extra || ""} />
                  </div>
                </fieldset>
              )}

              <div>
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
