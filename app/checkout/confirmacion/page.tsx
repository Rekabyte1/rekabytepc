"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { useCheckout } from "@/components/CheckoutStore";
import { useCart, CLP } from "@/components/CartContext";

type Stage = "review" | "upload";

export default function Paso4Confirmacion() {
  const { pago, envio } = useCheckout();
  const { subtotalTransfer, subtotalCard } = useCart();

  // Estado local: mismo paso 4 con dos "apartados"
  const [stage, setStage] = useState<Stage>("review");
  const [orderId, setOrderId] = useState<string>("");

  // Genera y fija un ID de orden simple al pasar a "upload"
  useEffect(() => {
    if (stage === "upload" && !orderId) {
      const id = "RB" + Date.now().toString().slice(-6);
      setOrderId(id);
    }
  }, [stage, orderId]);

  const payingWithTransfer = (pago?.metodo ?? "transferencia") === "transferencia";
  const selectedSubtotal = useMemo(
    () => (payingWithTransfer ? subtotalTransfer : subtotalCard),
    [payingWithTransfer, subtotalTransfer, subtotalCard]
  );
  const total = selectedSubtotal + (envio?.costoEnvio ?? 0);

  return (
    <main className="checkout-page">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-2 text-2xl font-extrabold text-white">Confirmación</h1>
        <CheckoutSteps active={3} />

        <div className="grid-two">
          {/* IZQUIERDA */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
            {stage === "review" ? (
              <>
                {/* Forma de entrega */}
                <div className="mb-5">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-100">Forma de entrega</h3>
                    <Link href="/checkout/envio" className="text-lime-400">Modificar</Link>
                  </div>
                  <div className="text-sm text-neutral-300">
                    {envio?.tipo === "pickup" ? (
                      <>
                        Retiro en tienda (gratis)
                        <br />
                        Real Audiencia 1170, San Miguel
                      </>
                    ) : (
                      <>
                        Despacho a domicilio
                        <br />
                        {envio?.direccion ?? "Dirección no especificada"}
                      </>
                    )}
                    <div className="mt-1 text-neutral-400">
                      Costo envío:{" "}
                      <span className="text-neutral-200">{CLP(envio?.costoEnvio ?? 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Medio de pago */}
                <div className="mb-5">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-100">Medio de pago</h3>
                    <Link href="/checkout/pago" className="text-lime-400">Modificar</Link>
                  </div>
                  <div className="text-sm text-neutral-300">
                    {payingWithTransfer ? (
                      <>
                        Transferencia / Depósito bancario
                        <div className="text-neutral-400">
                          Documento: {pago?.documento ?? "boleta"}
                        </div>
                      </>
                    ) : pago?.metodo === "webpay" ? (
                      <>Webpay</>
                    ) : (
                      <>Mercado Pago</>
                    )}
                  </div>
                </div>

                {/* Acciones: sin input de archivo aquí */}
                <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                  {payingWithTransfer ? (
                    <>
                      <p className="text-sm text-neutral-300">
                        Al confirmar te mostraremos los datos bancarios para realizar la transferencia.
                        Tendrás <strong>24 horas</strong> para subir tu/ tus comprobantes.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          className="rb-btn"
                          onClick={() => setStage("upload")}
                        >
                          Confirmar compra y ver datos de transferencia
                        </button>
                        <Link href="/" className="rb-btn--ghost rb-btn">Volver al inicio</Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-neutral-300">
                        Revisa que tus datos sean correctos antes de continuar.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button className="rb-btn">Pagar</button>
                        <Link href="/checkout/pago" className="rb-btn--ghost rb-btn">
                          Cambiar medio de pago
                        </Link>
                      </div>
                    </>
                  )}
                </div>

                {/* Total */}
                <div className="mt-6 text-right text-lg font-bold text-neutral-100">
                  Total a pagar: <span className="text-lime-400">{CLP(total)}</span>
                </div>
              </>
            ) : (
              // === Apartado "Subir comprobantes" dentro del mismo paso 4 ===
              <>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Subir comprobantes{" "}
                    <span className="text-sm font-normal text-neutral-300">
                      — Orden <span className="font-semibold text-white">#{orderId}</span>
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-neutral-300">
                    Realiza la(s) transferencia(s) y adjunta los comprobantes lo antes posible.
                    Reservaremos los productos por un máximo de <strong>24 horas</strong>.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Izquierda: upload */}
                  <div className="rounded-xl border border-neutral-800 p-4">
                    <h3 className="mb-2 text-lg font-semibold text-white">Adjunta tus comprobantes</h3>
                    <div className="rounded-lg border border-dashed border-neutral-700 p-6 text-center">
                      <input type="file" multiple className="mx-auto block text-sm text-neutral-200" />
                      <p className="mt-2 text-xs text-neutral-500">
                        Formatos: pdf, jpg, jpeg, png. Máx. 10&nbsp;MB por archivo.
                      </p>
                    </div>
                    <button className="rb-btn mt-4">Guardar comprobantes</button>
                  </div>

                  {/* Derecha: datos bancarios */}
                  <div className="rounded-xl border border-neutral-800 p-4">
                    <h3 className="mb-2 text-lg font-semibold text-white">Datos para transferir</h3>
                    <ul className="space-y-1 text-sm">
                      <li><span className="text-neutral-400">Destinatario:</span> reka SPA</li>
                      <li><span className="text-neutral-400">RUT:</span> 20.420.860</li>
                      <li className="mt-2 text-neutral-400">Cuentas disponibles:</li>
                      <li>Banco Santander – Cta Cte 6xxxx</li>
                      <li>Banco Estado – Cta Cte 1xxxxx</li>
                      <li className="mt-2">
                        <span className="text-neutral-400">E-mail:</span> reka@byte.cl
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" className="rb-btn--ghost rb-btn" onClick={() => setStage("review")}>
                    Volver a confirmación
                  </button>
                  <Link href="/" className="rb-btn">Finalizar</Link>
                </div>
              </>
            )}
          </section>

          {/* DERECHA — se mantiene siempre */}
          <CheckoutSummary />
        </div>
      </div>
    </main>
  );
}
