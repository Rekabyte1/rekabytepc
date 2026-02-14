"use client";

import Image from "next/image";
import { Product } from "@/lib/catalog";
import { useCart, CLP } from "@/components/CartContext";

const PLACEHOLDER = "/product-placeholder.png";

type Props = { p?: Product | null };

export default function ProductCard({ p }: Props) {
  const { addItem } = useCart();

  // Fallback (no crash)
  if (!p) {
    return (
      <article className="overflow-hidden rounded-3xl border border-neutral-800/70 bg-neutral-950/50 shadow-[0_10px_40px_rgba(0,0,0,0.35)] opacity-70">
        <div className="relative aspect-[16/10] bg-neutral-950">
          <Image
            src={PLACEHOLDER}
            alt="Producto no disponible"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>

        <div className="p-5">
          <div className="text-center">
            <div className="text-xs text-neutral-400">—</div>
            <h3 className="mt-1 text-xl font-extrabold text-white">
              Producto no disponible
            </h3>
            <div className="mt-3 text-lg font-extrabold text-lime-400">
              {CLP(0)}
            </div>
            <div className="mt-1 text-xs text-neutral-400">
              Otros medios: {CLP(0)}
            </div>
          </div>

          <div className="mt-5">
            <button
              className="w-full rounded-full bg-neutral-800/60 px-4 py-3 text-sm font-semibold text-neutral-400 cursor-not-allowed"
              disabled
            >
              Sin stock
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Cover robusto
  const cover =
    p.image ??
    (p as any)?.images?.find?.((x: string | null | undefined) => !!x) ??
    PLACEHOLDER;

  const title = p.title || "Producto";
  const gpu = p.gpu?.toUpperCase?.() ?? "—";
  const cpu = p.cpu ? p.cpu.replaceAll("-", " ").toUpperCase() : "—";

  // Si tienes stock real en Product, úsalo; si no, asumimos disponible
  const stock = (p as any)?.stock ?? 999999;
  const isOut = stock <= 0;

  return (
    <article className="group overflow-hidden rounded-3xl border border-neutral-800/70 bg-neutral-950/50 shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5">
      {/* Imagen */}
      <div className="relative aspect-[16/10] bg-neutral-950">
        <Image
          src={cover}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 400px"
          unoptimized={/^https?:\/\//.test(cover)}
        />

        {/* Chip stock */}
        <div className="absolute left-3 top-3">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
              isOut
                ? "border-red-500/40 bg-red-500/10 text-red-200"
                : "border-neutral-700 bg-black/35 text-neutral-100"
            }`}
          >
            {isOut ? "Agotado" : "Disponible"}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        <div className="text-center">
          <div className="text-xs text-neutral-400">Negro</div>

          <h3 className="mt-1 text-xl font-extrabold text-white">{title}</h3>

          <p className="mt-2 text-sm text-neutral-300">
            GPU: <span className="text-neutral-100">{gpu}</span> • CPU:{" "}
            <span className="text-neutral-100">{cpu}</span>
          </p>

          {/* Precios */}
          <div className="mt-4">
            <div className="text-[13px] text-neutral-400">desde</div>
            <div className="mt-1 text-2xl font-extrabold text-white">
              {CLP(p.priceTransfer)}
            </div>
            <div className="mt-1 text-xs text-neutral-400">
              otros medios: {CLP(p.priceCard)}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-5 grid gap-3">
          <button
            type="button"
            disabled={isOut}
            onClick={() =>
              addItem(
                {
                  id: p.id,
                  name: title,
                  image: cover,
                  priceTransfer: p.priceTransfer,
                  priceCard: p.priceCard,
                },
                1
              )
            }
            className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition-colors ${
              isOut
                ? "cursor-not-allowed bg-neutral-800/60 text-neutral-400"
                : "bg-lime-400 text-black hover:bg-lime-300"
            }`}
          >
            Agregar al carrito
          </button>

          <button
            type="button"
            className="w-full rounded-full border border-lime-400/40 bg-transparent px-4 py-3 text-sm font-semibold text-lime-300 hover:bg-lime-400/10"
            onClick={() => {
              // Si después quieres abrir un drawer/modal aquí, lo conectamos.
              // Por ahora lo dejamos como CTA secundaria sin romper nada.
              // Ej: router.push(`/producto/${p.id}`) si tienes esa ruta.
              window?.scrollTo?.({ top: 0, behavior: "smooth" });
            }}
          >
            Leer más
          </button>
        </div>

        {/* Mini specs (opcional) */}
        <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900/25 p-4">
          <div className="text-sm font-bold text-white">Componentes (resumen)</div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-neutral-950/35 px-3 py-2">
              <span className="text-xs text-neutral-400">GPU</span>
              <span className="text-xs font-semibold text-neutral-100">{gpu}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-neutral-950/35 px-3 py-2">
              <span className="text-xs text-neutral-400">CPU</span>
              <span className="text-xs font-semibold text-neutral-100">{cpu}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm font-semibold text-neutral-200 hover:bg-neutral-900"
          onClick={() => {
            // Aquí también podemos abrir el drawer de specs si quieres unificarlo.
            // Cuando me pases cómo quieres el drawer para Product, lo conectamos.
            window?.scrollTo?.({ top: 0, behavior: "smooth" });
          }}
        >
          Mostrar especificaciones completas
        </button>
      </div>
    </article>
  );
}
