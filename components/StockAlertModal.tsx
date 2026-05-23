// components/StockAlertModal.tsx
"use client";

import { useEffect, useState } from "react";

type StockAlertModalProps = {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
};

type ApiResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
};

export default function StockAlertModal({
  open,
  onClose,
  productId,
  productName,
}: StockAlertModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setStatus("idle");
      setMessage("");
      setEmail("");
    }
  }, [open]);

  if (!open) return null;

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setStatus("error");
      setMessage("Ingresa un correo válido.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await fetch("/api/stock-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          email: normalizedEmail,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as ApiResponse;

      if (!res.ok || data?.ok === false) {
        setStatus("error");
        setMessage(data?.error || "No se pudo registrar la alerta. Inténtalo nuevamente.");
        return;
      }

      setStatus("success");
      setMessage(data?.message || "¡Listo! Te avisaremos cuando vuelva el stock.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Error de conexión. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-alert-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-lime-400/20 bg-neutral-950/95 text-neutral-100 shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
        <div className="pointer-events-none absolute -top-16 right-[-40px] h-44 w-44 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-[-60px] h-48 w-48 rounded-full bg-lime-400/5 blur-3xl" />

        <div className="relative p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-lime-300">
                RekaByte Alerts
              </p>
              <h3 id="stock-alert-title" className="text-lg font-extrabold text-white sm:text-xl">
                Notifícame cuando vuelva stock
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Cerrar"
              className="rounded-lg border border-neutral-700 bg-neutral-900/80 px-2.5 py-1.5 text-xs font-bold text-neutral-300 transition hover:border-lime-400/40 hover:text-lime-200 disabled:opacity-60"
            >
              Cerrar
            </button>
          </div>

          <div className="mb-4 rounded-xl border border-neutral-800 bg-black/30 p-3">
            <p className="text-xs text-neutral-400">Producto</p>
            <p className="mt-1 text-sm font-semibold text-neutral-100">{productName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Correo electrónico
              </span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                disabled={loading}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/20 disabled:opacity-60"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-extrabold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Registrando..." : "Avisarme cuando vuelva"}
            </button>
          </form>

          {status !== "idle" ? (
            <div
              className={`mt-4 rounded-xl border px-3 py-2.5 text-sm ${
                status === "success"
                  ? "border-lime-400/35 bg-lime-400/10 text-lime-200"
                  : "border-red-400/35 bg-red-500/10 text-red-200"
              }`}
            >
              {message}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}