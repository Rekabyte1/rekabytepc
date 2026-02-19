"use client";

import React, { FormEvent, useMemo, useState } from "react";

const STATUS_OPTIONS = [
  { value: "PENDING_PAYMENT", label: "Pendiente de pago" },
  { value: "PAID", label: "Pagado" },
  { value: "PREPARING", label: "Preparando pedido" },
  { value: "SHIPPED", label: "Despachado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "COMPLETED", label: "Completado / Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
] as const;

type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

type Props = {
  orderId: string;
  currentStatus: StatusValue | string | null;
  currentNotes: string | null;
};

function safeStr(v: unknown) {
  return String(v ?? "").trim();
}

export default function AdminOrderStatusForm({
  orderId,
  currentStatus,
  currentNotes,
}: Props) {
  const initialStatus: StatusValue =
    (currentStatus as StatusValue) || "PENDING_PAYMENT";

  const initialNote = safeStr(currentNotes ?? "");

  const [status, setStatus] = useState<StatusValue>(initialStatus);
  const [note, setNote] = useState<string>(initialNote);
  const [sendEmail, setSendEmail] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  const changed = useMemo(() => {
    return (
      safeStr(status) !== safeStr(currentStatus) ||
      safeStr(note) !== initialNote
    );
  }, [status, note, currentStatus, initialNote]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setSaved(false);
    setEmailMsg(null);

    try {
      const resp = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderId)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            noteInternal: note,
            sendEmail,
          }),
          credentials: "same-origin",
        }
      );

      const data = await resp.json().catch(() => null);

      if (!resp.ok || !data?.ok) {
        setError(data?.error ?? "No se pudo guardar el estado.");
        return;
      }

      setSaved(true);

      if (sendEmail) {
        const em = data?.email;
        if (em?.ok) setEmailMsg("Correo enviado al cliente.");
        else if (em && em?.ok === false)
          setEmailMsg(`No se pudo enviar correo: ${em?.error ?? "error"}`);
        else setEmailMsg("Correo: sin respuesta.");
      }

      window.location.reload();
    } catch (err) {
      console.error(err);
      setError("Error de red al guardar cambios.");
    } finally {
      setLoading(false);
    }
  }

  function buildClientTemplate() {
    const selected = STATUS_OPTIONS.find((s) => s.value === status);
    const label = selected ? selected.label : "tu pedido";

    return `Hola, te escribimos desde RekaByte.

Actualización de tu pedido (${orderId.slice(-8).toUpperCase()}):
Estado: ${label}

${note ? `Mensaje: ${note}\n` : ""}
Saludos,
RekaByte`;
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-black/30 backdrop-blur-sm p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Estado */}
        <div className="space-y-2">
          <label className="text-sm font-extrabold text-neutral-300">
            Estado del pedido
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusValue)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-neutral-900">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Nota */}
        <div className="space-y-2">
          <label className="text-sm font-extrabold text-neutral-300">
            Mensaje para el cliente
          </label>

          <textarea
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Tu pedido ya fue despachado. Te enviaremos el tracking en breve."
            className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
          />

          <p className="text-xs text-neutral-500">
            Se guardará en el pedido y (si está activado) se enviará por correo.
          </p>
        </div>

        {/* Checkbox */}
        <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="h-4 w-4 accent-lime-400"
          />
          <span className="text-sm font-extrabold text-neutral-200">
            Enviar actualización por correo
          </span>
        </div>

        {/* Estados visuales */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
            {error}
          </div>
        )}

        {saved && !error && (
          <div className="rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-3 text-sm font-bold text-lime-300">
            Cambios guardados correctamente.
          </div>
        )}

        {emailMsg && (
          <div className="rounded-xl border border-neutral-700 bg-black/40 px-4 py-3 text-sm font-bold text-neutral-200">
            {emailMsg}
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-wrap gap-4 pt-2">
          <button
            type="submit"
            disabled={loading || !changed}
            className={[
              "rounded-xl px-5 py-2.5 text-sm font-extrabold transition",
              loading || !changed
                ? "cursor-not-allowed border border-neutral-700 bg-neutral-900 text-neutral-600"
                : "bg-lime-400 text-black hover:bg-lime-300 shadow-md shadow-lime-400/20",
            ].join(" ")}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(buildClientTemplate());
              } catch {}
            }}
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-5 py-2.5 text-sm font-extrabold text-neutral-200 hover:bg-neutral-800 transition"
          >
            Copiar texto para WhatsApp
          </button>
        </div>
      </form>
    </div>
  );
}
