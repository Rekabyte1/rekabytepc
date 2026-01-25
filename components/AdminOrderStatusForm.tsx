"use client";

import { FormEvent, useState } from "react";

const STATUS_OPTIONS = [
  { value: "PENDING_PAYMENT", label: "Pendiente de pago" },
  { value: "PAID",             label: "Pagado" },
  { value: "PREPARING",        label: "Preparando pedido" },
  { value: "SHIPPED",          label: "Despachado" },
  { value: "COMPLETED",        label: "Completado / Entregado" },
  { value: "CANCELLED",        label: "Cancelado" },
] as const;

type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

type Props = {
  orderId: string;
  currentStatus: StatusValue | string | null;
  currentNotes: string | null;
};

export default function AdminOrderStatusForm({
  orderId,
  currentStatus,
  currentNotes,
}: Props) {
  const initialStatus: StatusValue =
    (currentStatus as StatusValue) || "PENDING_PAYMENT";

  const [status, setStatus] = useState<StatusValue>(initialStatus);
  const [note, setNote] = useState<string>(currentNotes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const resp = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          noteInternal: note,
        }),
        // 👇 importante para que se envíe la cookie admin_token
        credentials: "same-origin",
      });

      // Siempre esperamos JSON desde la API
      const data = await resp.json().catch(() => null);

      if (!resp.ok || !data?.ok) {
        setError(data?.error ?? "No se pudo guardar el estado.");
        return;
      }

      setSaved(true);
    } catch (err) {
      console.error(err);
      setError("Error de red al guardar cambios.");
    } finally {
      setLoading(false);
    }
  }

  function buildClientTemplate() {
    // Texto “sugerido para cliente”
    const selected = STATUS_OPTIONS.find((s) => s.value === status);
    const label = selected ? selected.label.toLowerCase() : "tu pedido";

    return `Hola [Nombre], recibimos tu pedido y ya está en estado: ${label}.`;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      <h3 className="text-base font-semibold text-white">
        Estado del pedido
      </h3>

      <div className="space-y-1 text-sm">
        <label className="text-neutral-300">
          Estado de pago / preparación
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusValue)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1 text-sm">
        <label className="text-neutral-300">
          Nota interna / mensaje sugerido para cliente
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
        />
        <p className="text-xs text-neutral-500">
          Usa esta nota como recordatorio de lo que debes avisar al cliente por
          correo o WhatsApp.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="text-sm text-lime-400">
          Cambios guardados.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            loading
              ? "cursor-wait border border-neutral-700 bg-neutral-800 text-neutral-300"
              : "bg-lime-400 text-black hover:bg-lime-300"
          }`}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>

        <button
          type="button"
          onClick={() => setNote(buildClientTemplate())}
          className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-100 hover:bg-neutral-800"
        >
          Copiar texto para enviar al cliente
        </button>
      </div>
    </form>
  );
}
