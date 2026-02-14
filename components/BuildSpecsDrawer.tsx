"use client";

import Portal from "./Portal";

type Spec = { label: string; value: string };

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  image?: string | null;
  specs?: Spec[];
  priceTransfer?: number;
  priceCard?: number;
  stock?: number;
  fpsInfo?: string | null;
};

const CLP = (n: number) =>
  n.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

export default function BuildSpecsDrawer({
  open,
  onClose,
  title,
  image,
  specs = [],
  priceTransfer,
  priceCard,
  stock,
  fpsInfo,
}: Props) {
  // ✅ IMPORTANTÍSIMO: si no está abierto, NO renderizamos nada.
  // Esto evita que quede una capa invisible bloqueando clicks.
  if (!open) return null;

  const isOut = (stock ?? 0) <= 0;

  return (
    <Portal>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 z-[9999] h-dvh w-[420px] max-w-[92vw]
          border-l border-neutral-800 bg-neutral-950/95
          shadow-[0_0_60px_rgba(0,0,0,0.65)]"
        role="dialog"
        aria-label="Especificaciones"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-800 px-5 py-4">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-neutral-400">
              Especificaciones
            </div>
            <h3 className="mt-1 line-clamp-2 text-lg font-extrabold text-white">
              {title}
            </h3>
            {fpsInfo ? (
              <div className="mt-2 text-xs text-neutral-400">{fpsInfo}</div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-700 bg-neutral-900/50 px-3 py-1 text-sm text-neutral-200 hover:bg-neutral-900"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="h-[calc(100dvh-64px)] overflow-y-auto px-5 py-4">
          {/* Imagen */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-3">
            <div className="aspect-[16/10] overflow-hidden rounded-xl bg-neutral-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image || "/pc1.jpg"}
                alt={title}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-neutral-900/60 p-3">
                <div className="text-[11px] uppercase tracking-wide text-neutral-400">
                  Transferencia
                </div>
                <div className="mt-1 font-extrabold text-lime-400">
                  {typeof priceTransfer === "number" ? CLP(priceTransfer) : "—"}
                </div>
              </div>

              <div className="rounded-xl bg-neutral-900/60 p-3">
                <div className="text-[11px] uppercase tracking-wide text-neutral-400">
                  Otros medios
                </div>
                <div className="mt-1 font-bold text-neutral-100">
                  {typeof priceCard === "number" ? CLP(priceCard) : "—"}
                </div>
              </div>
            </div>

            <div className="mt-2 text-xs text-neutral-500">
              Stock:{" "}
              <span
                className={`font-semibold ${
                  isOut ? "text-red-400" : "text-neutral-200"
                }`}
              >
                {typeof stock === "number" ? (isOut ? "Agotado" : stock) : "—"}
              </span>
            </div>
          </div>

          {/* Componentes */}
          <div className="mt-5">
            <h4 className="text-sm font-bold text-white">Componentes</h4>
            <div className="mt-2 h-[1px] w-full bg-lime-500/40" />

            <div className="mt-3 space-y-2">
              {specs?.length ? (
                specs.map((s, i) => (
                  <div
                    key={`${s.label}-${i}`}
                    className="flex items-start justify-between gap-4 rounded-xl
                      border border-neutral-800 bg-neutral-900/40 px-3 py-2"
                  >
                    <div className="text-xs text-neutral-400">{s.label}</div>
                    <div className="text-right text-xs font-semibold text-neutral-100">
                      {s.value}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-3 text-sm text-neutral-400">
                  No hay especificaciones para este modelo.
                </div>
              )}
            </div>
          </div>

          <div className="h-6" />
        </div>
      </aside>
    </Portal>
  );
}
