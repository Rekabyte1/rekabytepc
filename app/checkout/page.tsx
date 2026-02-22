"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { Customer, useCheckout } from "@/components/CheckoutStore";
import { useCheckoutGuard } from "@/components/useCheckoutGuard";
import { useSession } from "next-auth/react";

export default function Paso1Datos() {
  useCheckoutGuard(1);

  const router = useRouter();
  const checkout = useCheckout();

  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";

  const [profileLoading, setProfileLoading] = useState(false);
  const [profilePrefill, setProfilePrefill] = useState<Partial<Customer> | null>(null);

  // Checkbox “Guardar en mi cuenta”
  const [saveToAccount, setSaveToAccount] = useState(true);

  // Datos actuales (store > sessionStorage legacy)
  const datos = useMemo(() => {
    const fromStore = checkout.customer;
    if (fromStore) return fromStore;

    if (typeof window !== "undefined") {
      try {
        const raw = window.sessionStorage.getItem("checkout_customer_v1");
        if (raw) return JSON.parse(raw);
      } catch {}
      try {
        const raw2 = window.sessionStorage.getItem("checkout_datos");
        if (raw2) return JSON.parse(raw2);
      } catch {}
    }

    return null;
  }, [checkout.customer]);

  // Prefill desde /api/account/profile si está logeado
  useEffect(() => {
    if (!isAuthed) return;

    let cancelled = false;

    (async () => {
      setProfileLoading(true);
      try {
        const r = await fetch("/api/account/profile", { cache: "no-store" });
        const j = await r.json().catch(() => null);

        if (!cancelled && r.ok && j?.ok && j?.user) {
          const u = j.user as {
            name?: string;
            lastName?: string;
            email?: string;
            phone?: string;
            rut?: string;
          };

          setProfilePrefill({
            nombre: (u.name || "").trim(),
            apellido: (u.lastName || "").trim(),
            email: (u.email || session?.user?.email || "").trim(),
            telefono: (u.phone || "").trim(),
            rut: (u.rut || "").trim(),
          });
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthed, session?.user?.email]);

  const dv = (datos ?? profilePrefill) as Partial<Customer> | null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const nextCustomer: Customer = {
      nombre: String(fd.get("nombre") || "").trim(),
      apellido: String(fd.get("apellido") || "").trim(),
      rut: String(fd.get("rut") || "").trim(),
      telefono: String(fd.get("telefono") || "").trim(),
      email: String(fd.get("email") || "").trim(),
    };

    // 1) Guardar en store (y sessionStorage por el store)
    checkout.setCustomer(nextCustomer);

    // 2) Si está logeado y el usuario quiere, persistir en su cuenta
    if (isAuthed && saveToAccount) {
      try {
        await fetch("/api/account/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nextCustomer.nombre,
            lastName: nextCustomer.apellido,
            phone: nextCustomer.telefono,
            rut: nextCustomer.rut,
          }),
        });
      } catch {
        // No bloquea el checkout
      }
    }

    router.push("/checkout/envio");
  };

  return (
    <main className="rb-container checkout-step">
      <h1 className="cs-title">Tus datos</h1>

      <div className="cs-steps">
        <CheckoutSteps active={0} />
      </div>

      <div className="cs-grid">
        <section className="cs-card">
          <div className="cs-head">
            <div className="cs-accent" />
            <div>
              <h2 className="cs-card-title">
                Paso 1: Datos de contacto
              </h2>
              <p className="cs-card-sub">
                Usaremos estos datos para enviarte la confirmación y coordinar la entrega o retiro.
              </p>
              {profileLoading && (
                <p className="cs-card-sub" style={{ marginTop: 8 }}>
                  Cargando datos de tu cuenta…
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="cs-form">
            <div className="cs-two">
              <div className="cs-field">
                <label className="cs-label">Nombre</label>
                <input
                  name="nombre"
                  required
                  defaultValue={dv?.nombre ?? ""}
                  className="cs-input"
                  autoComplete="given-name"
                />
              </div>

              <div className="cs-field">
                <label className="cs-label">Apellido</label>
                <input
                  name="apellido"
                  required
                  defaultValue={dv?.apellido ?? ""}
                  className="cs-input"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="cs-two">
              <div className="cs-field">
                <label className="cs-label">RUT (opcional)</label>
                <input
                  name="rut"
                  defaultValue={dv?.rut ?? ""}
                  className="cs-input"
                  placeholder="12.345.678-9"
                  autoComplete="off"
                />
              </div>

              <div className="cs-field">
                <label className="cs-label">Teléfono</label>
                <input
                  name="telefono"
                  required
                  defaultValue={dv?.telefono ?? ""}
                  className="cs-input"
                  placeholder="+56 9 1234 5678"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="cs-field">
              <label className="cs-label">Correo electrónico</label>
              <input
                name="email"
                type="email"
                required
                defaultValue={dv?.email ?? session?.user?.email ?? ""}
                className="cs-input"
                placeholder="tucorreo@ejemplo.cl"
                autoComplete="email"
              />
            </div>

            {isAuthed && (
              <label className="cs-check">
                <input
                  type="checkbox"
                  checked={saveToAccount}
                  onChange={(e) => setSaveToAccount(e.target.checked)}
                />
                <span>Guardar estos datos en mi cuenta para futuras compras</span>
              </label>
            )}

            <div className="cs-actions">
              <button type="button" onClick={() => router.back()} className="rb-btn rb-btn--ghost">
                Volver
              </button>
              <button type="submit" className="rb-btn">
                Continuar
              </button>
            </div>
          </form>
        </section>

        <aside className="cs-summary">
          <CheckoutSummary />
        </aside>
      </div>

      <style jsx>{`
        .checkout-step { padding-top: 24px; padding-bottom: 24px; }
        .cs-title { margin: 0 0 10px; font-size: 30px; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
        .cs-steps { margin-bottom: 14px; }
        .cs-grid { display: grid; grid-template-columns: 1fr; gap: 18px; align-items: start; }
        @media (min-width: 1024px) { .cs-grid { grid-template-columns: 1fr 420px; gap: 22px; } }
        .cs-card { background: #0d0d0d; border: 1px solid #262626; border-radius: 16px; padding: 18px; box-shadow: 0 14px 40px rgba(0,0,0,.45); }
        .cs-head { display: grid; grid-template-columns: 10px 1fr; gap: 12px; align-items: start; margin-bottom: 14px; }
        .cs-accent { width: 4px; height: 24px; border-radius: 999px; background: #b6ff2e; margin-top: 2px; }
        .cs-card-title { margin: 0; color: #fff; font-size: 18px; font-weight: 800; }
        .cs-card-sub { margin: 6px 0 0; color: #a3a3a3; font-size: 14px; line-height: 1.5; }
        .cs-form { display: grid; gap: 14px; }
        .cs-two { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 768px) { .cs-two { grid-template-columns: 1fr 1fr; } }
        .cs-field { display: grid; gap: 6px; }
        .cs-label { color: #d4d4d4; font-size: 13px; font-weight: 700; }
        .cs-input { width: 100%; background: #141414; border: 1px solid #242424; color: #e5e7eb; border-radius: 12px; height: 44px; padding: 0 12px; }
        .cs-input::placeholder { color: #6b7280; }
        .cs-actions { display: flex; justify-content: space-between; gap: 10px; margin-top: 6px; flex-wrap: wrap; }
        .cs-actions .rb-btn { min-width: 160px; }
        .cs-summary { position: sticky; top: 1.5rem; }
        .cs-check { display: flex; gap: 10px; align-items: flex-start; color: #d4d4d4; font-size: 13px; }
        .cs-check input { margin-top: 3px; }
        .cs-check span { line-height: 1.35; }
        :global(.checkout-step input) { appearance: none; -webkit-appearance: none; }
      `}</style>
    </main>
  );
}