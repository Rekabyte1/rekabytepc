"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/catalog";
import { useCart, CLP } from "@/components/CartContext";

const PLACEHOLDER = "/product-placeholder.png";

type Props = { p?: Product | null };

export default function ProductCard({ p }: Props) {
  const { addItem, openCart } = useCart();

  if (!p) {
    return (
      <article className="group relative overflow-hidden rounded-3xl border border-neutral-700/70 bg-gradient-to-b from-neutral-900/80 via-neutral-950/85 to-black/90 shadow-[0_18px_55px_rgba(0,0,0,0.45)] opacity-75">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(163,230,53,0.08),transparent_42%),linear-gradient(170deg,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0.35)_75%)]" />
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-b from-neutral-900/70 to-black/80">
          <div className="pointer-events-none absolute inset-x-[16%] top-[30%] h-[40%] rounded-full bg-lime-400/10 blur-[64px]" />
          <Image
            src={PLACEHOLDER}
            alt="Producto no disponible"
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>

        <div className="relative p-5">
          <div className="text-center">
            <div className="text-xs tracking-wide text-neutral-400">—</div>
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
              className="w-full cursor-not-allowed rounded-full border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200"
              disabled
            >
              Sin stock
            </button>
          </div>
        </div>
      </article>
    );
  }

  const cover =
    p.image ??
    (p as any)?.images?.find?.((x: string | null | undefined) => !!x) ??
    PLACEHOLDER;

  const title = p.title || "Producto";
  const gpu = p.gpu?.toUpperCase?.() ?? "—";
  const cpu = p.cpu ? p.cpu.replaceAll("-", " ").toUpperCase() : "—";

  const stock = (p as any)?.stock ?? 999999;
  const isOut = stock <= 0;

  const slug = p.slug ?? p.id;
  const pricing = (p as any)?.pricing;
  const transferBase = pricing?.transfer?.base ?? p.priceTransfer;
  const transferFinal = pricing?.transfer?.final ?? p.priceTransfer;
  const cardBase = pricing?.card?.base ?? p.priceCard;
  const cardFinal = pricing?.card?.final ?? p.priceCard;
  const saleActive = Boolean(pricing?.sale?.active);
  const saleLabel = pricing?.sale?.label ?? "Oferta";
  const salePercent = pricing?.transfer?.discountPercent;

  const handleAdd = () => {
    if (isOut) return;

    addItem(
      {
        id: slug,
        slug,
        name: title,
        image: cover,
        priceTransfer: p.priceTransfer,
        priceCard: p.priceCard,
        stock: typeof stock === "number" ? stock : null,
        kind: "PREBUILT_PC",
      },
      1
    );

    openCart();
  };

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-neutral-700/70 bg-gradient-to-b from-neutral-900/80 via-neutral-950/85 to-black/95 shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-400 hover:-translate-y-1 hover:border-lime-400/35 hover:shadow-[0_28px_80px_rgba(132,204,22,0.12)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(163,230,53,0.08),transparent_42%),radial-gradient(circle_at_78%_0%,rgba(163,230,53,0.05),transparent_35%),linear-gradient(175deg,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0.35)_78%)]" />

      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-b from-neutral-900/70 via-neutral-950/70 to-black/85">
        <div className="pointer-events-none absolute inset-x-[16%] top-[28%] h-[44%] rounded-full bg-lime-400/12 blur-[70px]" />
        <Image
          src={cover}
          alt={title}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 400px"
          unoptimized={/^https?:\/\//.test(cover)}
        />

        <div className="absolute left-3 top-3">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
              isOut
                ? "border-red-500/35 bg-red-500/15 text-red-200"
                : "border-lime-400/30 bg-lime-400/12 text-lime-200"
            }`}
          >
            {isOut ? "Sin stock" : "Disponible"}
          </span>
        </div>

        {saleActive ? (
          <div className="absolute right-3 top-3 rounded-full border border-fuchsia-400/40 bg-fuchsia-600/90 px-3 py-1 text-xs font-extrabold text-white shadow-[0_10px_24px_rgba(217,70,239,0.35)]">
            {saleLabel} {salePercent ? `-${salePercent}%` : ""}
          </div>
        ) : null}
      </div>

      <div className="relative p-5">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Negro
          </div>

          <h3 className="mt-1 text-xl font-extrabold leading-tight text-white">
            {title}
          </h3>

          <p className="mt-2 text-sm text-neutral-300">
            GPU: <span className="text-neutral-100">{gpu}</span> • CPU:{" "}
            <span className="text-neutral-100">{cpu}</span>
          </p>

          <div className="mt-4 rounded-2xl border border-neutral-700/70 bg-gradient-to-b from-neutral-900/70 to-black/70 p-3">
            <div className="text-[13px] font-medium text-neutral-400">desde</div>
            {saleActive ? (
              <>
                <div className="mt-1 text-sm text-neutral-500 line-through">
                  {CLP(transferBase)}
                </div>
                <div className="mt-1 text-2xl font-extrabold text-lime-400">
                  {CLP(transferFinal)}
                </div>
                <div className="mt-1 text-xs text-neutral-500 line-through">
                  otros medios: {CLP(cardBase)}
                </div>
                <div className="mt-1 text-xs text-neutral-300">
                  otros medios: {CLP(cardFinal)}
                </div>
              </>
            ) : (
              <>
                <div className="mt-1 text-2xl font-extrabold text-lime-400">
                  {CLP(transferFinal)}
                </div>
                <div className="mt-1 text-xs text-neutral-400">
                  otros medios: {CLP(cardFinal)}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            disabled={isOut}
            onClick={handleAdd}
            className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition-all duration-300 ${
              isOut
                ? "cursor-not-allowed border border-neutral-700 bg-neutral-800/60 text-neutral-400"
                : "bg-lime-400 text-black shadow-[0_12px_24px_rgba(132,204,22,0.35)] hover:bg-lime-300"
            }`}
          >
            Agregar al carrito
          </button>

          <Link
            href={`/producto/${slug}`}
            className="w-full rounded-full border border-lime-400/35 bg-transparent px-4 py-3 text-center text-sm font-semibold text-lime-300 transition-all duration-300 hover:border-lime-300 hover:bg-lime-400/10"
          >
            Leer más
          </Link>
        </div>

        <div className="mt-5 rounded-2xl border border-neutral-700/70 bg-gradient-to-b from-neutral-900/55 to-black/55 p-4">
          <div className="text-sm font-bold text-white">Componentes (resumen)</div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded-xl border border-neutral-700/60 bg-neutral-950/35 px-3 py-2">
              <span className="text-xs text-neutral-400">GPU</span>
              <span className="text-xs font-semibold text-neutral-100">{gpu}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-neutral-700/60 bg-neutral-950/35 px-3 py-2">
              <span className="text-xs text-neutral-400">CPU</span>
              <span className="text-xs font-semibold text-neutral-100">{cpu}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/producto/${slug}`}
          className="mt-4 block w-full rounded-xl border border-neutral-700/70 bg-neutral-950/40 px-4 py-3 text-center text-sm font-semibold text-neutral-200 transition-all duration-300 hover:border-lime-400/30 hover:bg-neutral-900"
        >
          Mostrar especificaciones completas
        </Link>
      </div>
    </article>
  );
}