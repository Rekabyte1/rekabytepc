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
    return safeStr(status) !== safeStr(currentStatus) || safeStr(note) !== initialNote;
  }, [status, note, currentStatus, initialNote]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setSaved(false);
    setEmailMsg(null);

    try {
      const resp = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          noteInternal: note,
          sendEmail,
        }),
        credentials: "same-origin",
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok || !data?.ok) {
        setError(data?.error ?? "No se pudo guardar el estado.");
        return;
      }

      setSaved(true);

      if (sendEmail) {
        const em = data?.email;
        if (em?.ok) setEmailMsg("Correo enviado al cliente.");
        else if (em && em?.ok === false) setEmailMsg(`No se pudo enviar correo: ${em?.error ?? "error"}`);
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
    <form onSubmit={handleSubmit} className="mt-2 space-y-3">
      <div className="space-y-1 text-sm">
        <label className="text-neutral-300 font-extrabold">
          Estado de pago / preparación
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusValue)}
          className="w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1 text-sm">
        <label className="text-neutral-300 font-extrabold">
          Nota / mensaje para el cliente
        </label>
        <textarea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-lime-400/40"
        />
        <p className="text-xs text-neutral-500">
          Este texto se guardará en el pedido y (si está activado) se enviará por correo al cliente.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-200">
        <input
          type="checkbox"
          checked={sendEmail}
          onChange={(e) => setSendEmail(e.target.checked)}
          className="h-4 w-4 accent-lime-400"
        />
        <span className="font-extrabold">Enviar actualización por correo</span>
      </label>

      {error && <p className="text-sm font-bold text-red-300">{error}</p>}
      {saved && !error && <p className="text-sm font-bold text-lime-300">Cambios guardados.</p>}
      {emailMsg && <p className="text-sm font-bold text-neutral-200">{emailMsg}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading || !changed}
          className={[
            "rounded-xl px-4 py-2 text-sm font-extrabold",
            loading || !changed
              ? "cursor-not-allowed border border-neutral-800 bg-black/10 text-neutral-500"
              : "bg-lime-400 text-black hover:bg-lime-300",
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
          className="rounded-xl border border-neutral-800 bg-black/20 px-4 py-2 text-sm font-extrabold text-neutral-200 hover:bg-black/30"
        >
          Copiar texto
        </button>
      </div>
    </form>
  );
}
