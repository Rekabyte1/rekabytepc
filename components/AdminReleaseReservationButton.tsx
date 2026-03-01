// components/AdminReleaseReservationButton.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminReleaseReservationButton(props: {
  orderId: string;
  canShow: boolean;
}) {
  const { orderId, canShow } = props;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  if (!canShow) return null;

  async function handleRelease() {
    setErr(null);
    setOkMsg(null);

    const confirmed = window.confirm(
      "¿Liberar reserva y cancelar este pedido?\n\nEsto devolverá el stock y dejará el pedido en CANCELLED."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErr(data?.error || "No se pudo liberar la reserva.");
        return;
      }

      if (data.alreadyReleased) {
        setOkMsg("Esta reserva ya estaba liberada.");
      } else {
        setOkMsg("Reserva liberada. Stock devuelto y pedido cancelado.");
      }

      router.refresh();
    } catch {
      setErr("Error de red liberando la reserva.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-black/20 p-4">
      <div className="text-xs font-extrabold text-neutral-200">Reserva</div>
      <p className="mt-1 text-xs text-neutral-400">
        Solo aplica a pedidos por transferencia pendientes. Devuelve stock y cancela el pedido.
      </p>

      {err ? (
        <div className="mt-3 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs font-extrabold text-red-200">
          {err}
        </div>
      ) : null}

      {okMsg ? (
        <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-extrabold text-emerald-200">
          {okMsg}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleRelease}
        disabled={loading}
        className={[
          "mt-3 w-full rounded-xl border px-4 py-2 text-sm font-extrabold",
          loading
            ? "border-neutral-800 bg-neutral-900/40 text-neutral-400 cursor-not-allowed"
            : "border-red-400/30 bg-red-400/10 text-red-200 hover:bg-red-400/15",
        ].join(" ")}
      >
        {loading ? "Liberando..." : "Liberar reserva (cancelar pedido)"}
      </button>
    </div>
  );
}