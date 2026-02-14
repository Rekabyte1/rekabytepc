// /components/GameBuildCard.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Build } from "@/data/games";
import { BsBank2 } from "react-icons/bs";
import { FaBolt, FaRegHdd, FaCreditCard } from "react-icons/fa";
import { PiCpuFill } from "react-icons/pi";
import {
  MdMemory,
  MdPowerSettingsNew,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { useCart } from "@/components/CartContext";

// ✅ live desde BD (vía /api/by-slugs)
type LiveProduct = {
  slug: string;
  stock?: number | null;
  priceTransfer?: number | null;
  priceCard?: number | null;
  name?: string | null;
  title?: string | null;
  imageUrl?: string | null;
  isActive?: boolean | null;
};

type Props = { build: Build; gameTitle?: string };

const CLP = (n: number) =>
  n.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

export default function GameBuildCard({ build, gameTitle }: Props) {
  // Carrusel: forzamos 3 imágenes
  const [idx, setIdx] = useState(0);

  const images = useMemo(() => {
    const srcs = Array.isArray(build.images) ? build.images.filter(Boolean) : [];
    let arr = srcs.slice(0, 3);
    if (arr.length === 0) arr = ["/pc1.jpg", "/pc1.jpg", "/pc1.jpg"];
    if (arr.length === 1) arr = [arr[0], arr[0], arr[0]];
    if (arr.length === 2) arr = [arr[0], arr[1], arr[1]];
    return arr;
  }, [build.images]);

  const prev = () => setIdx((v) => (v - 1 + images.length) % images.length);
  const next = () => setIdx((v) => (v + 1) % images.length);

  // ✅ Stock desde BD (guard contra hydration mismatch)
  const [mounted, setMounted] = useState(false);
  const [live, setLive] = useState<LiveProduct | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/by-slugs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slugs: [build.productSlug] }),
        });

        const data = await res.json().catch(() => ({}));
        const item = Array.isArray(data?.items) ? data.items[0] : null;

        if (!cancelled) setLive(item ?? null);
      } catch {
        if (!cancelled) setLive(null);
      }
    }

    load();

    // (opcional) refresco suave cada 30s por si cambia stock sin recargar
    const t = setInterval(load, 30_000);

    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [mounted, build.productSlug]);

  // ✅ si hay BD -> usa BD; si no hay BD -> 0 (para no mentir con “2,2,5”)
  const stock = typeof live?.stock === "number" ? live.stock : 0;
  const isOut = stock <= 0;
  const isLow = stock > 0 && stock <= 3;

  // Toggle specs
  const [open, setOpen] = useState(false);

  // Carrito
  const { addItem, openCart } = useCart();
  const handleAdd = () => {
    if (stock <= 0) return;

    addItem(
      {
        id: build.productSlug,
        name: build.title,
        image: images[0],
        priceTransfer: build.priceTransfer,
        priceCard: build.priceCard,
      },
      1
    );
    openCart();
  };

  // Iconos por label
  const iconFor = useMemo(
    () => ({
      "Tarjeta de video": <FaBolt className="h-4 w-4" />,
      CPU: <PiCpuFill className="h-4 w-4" />,
      "Placa madre": <FaBolt className="h-4 w-4" />,
      RAM: <MdMemory className="h-4 w-4" />,
      "Unidad SSD": <FaRegHdd className="h-4 w-4" />,
      "Fuente de poder": <MdPowerSettingsNew className="h-4 w-4" />,
      Gabinete: <FaBolt className="h-4 w-4" />,
    }),
    []
  );

  // URL SEO del modelo
  const href = `/modelos/${encodeURIComponent(build.productSlug)}`;

  // (Opcional futuro) video bajo la config
  const videoUrl = (build as any)?.videoUrl as string | undefined;

  return (
    <article
      data-build-card
      className="rb-model-card group overflow-hidden rounded-2xl border border-neutral-800/70 bg-neutral-950/55 shadow-[0_12px_44px_rgba(0,0,0,0.45)]"
    >
      {/* Media */}
      <Link
        href={href}
        className="card-media relative block aspect-[16/10] w-full bg-neutral-950"
        aria-label={`Ver detalles de ${build.title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[idx]}
          alt={build.title}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          draggable={false}
        />

        {/* Overlay visual (NO debe captar clicks) */}
        <div className="rb-card-media-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Stock pill */}
        <div className="absolute left-3 top-3 z-10">
          <div
            className={[
              "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur",
              isOut
                ? "border-red-500/40 bg-red-500/10 text-red-200"
                : "border-neutral-700 bg-black/35 text-neutral-100",
            ].join(" ")}
            suppressHydrationWarning
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {mounted ? (isOut ? "Agotado" : `Stock: ${stock}`) : "Stock: —"}
            {mounted && isLow && !isOut ? (
              <span className="ml-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-200">
                Últimas
              </span>
            ) : null}
          </div>
        </div>

        {/* Controles carrusel */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prev();
              }}
              aria-label="anterior"
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-neutral-700 bg-black/40 p-2 text-white hover:bg-black/60"
            >
              <MdChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                next();
              }}
              aria-label="siguiente"
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-neutral-700 bg-black/40 p-2 text-white hover:bg-black/60"
            >
              <MdChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-2 left-0 right-0 z-10 flex items-center justify-center gap-2">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={[
                    "h-1.5 w-6 rounded-full",
                    i === idx ? "bg-lime-400" : "bg-white/25",
                  ].join(" ")}
                />
              ))}
            </div>
          </>
        )}
      </Link>

      {/* Content */}
      <div className="card-pad p-5">
        {/* Título (clickeable) */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-neutral-400"></div>
            <Link
              href={href}
              className="mt-1 inline-block text-xl font-extrabold text-white hover:text-lime-200"
            >
              {build.title}
            </Link>
            {build.fpsInfo ? (
              <div className="mt-2 text-sm text-neutral-300">
                <span className="text-neutral-200">{build.fpsInfo}</span>
                {gameTitle ? (
                  <span className="text-neutral-500"> • {gameTitle}</span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* Precios */}
        <div className="price-box mt-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-neutral-300">
              <BsBank2 className="h-4 w-4 text-lime-400" />
              <span className="text-sm">Transferencia</span>
            </div>
            <div className="text-lg font-extrabold text-lime-400">
              {CLP(build.priceTransfer)}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-neutral-300">
              <FaCreditCard className="h-4 w-4 text-neutral-300" />
              <span className="text-sm">Otros medios (Webpay / Mercado Pago)</span>
            </div>
            <div className="text-base font-semibold text-neutral-100">
              {CLP(build.priceCard)}
            </div>
          </div>

          <div className="mt-2 text-xs text-neutral-500">
            * Precio final puede variar por medio de pago y envío.
          </div>
        </div>

        {/* CTA carrito */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!mounted || isOut}
            className={[
              "btn-primary w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors",
              !mounted || isOut
                ? "cursor-not-allowed bg-neutral-800/60 text-neutral-400"
                : "bg-lime-400 text-black hover:bg-lime-300",
            ].join(" ")}
          >
            {!mounted ? "Cargando…" : isOut ? "Agotado" : "Agregar al carrito"}
          </button>
        </div>

        {/* Specs */}
        {build.specs?.length ? (
          <div className="mt-4">
            <div className="mb-2 text-sm font-bold text-white">
              Componentes (resumen)
            </div>

            <div className="specs-grid grid gap-2">
              {(open ? build.specs : build.specs.slice(0, 6)).map((s, i) => {
                const iconKey = (
                  Object.keys(iconFor) as Array<keyof typeof iconFor>
                ).find((k) => s.label.startsWith(k));
                const ico = iconKey ? iconFor[iconKey] : <FaBolt className="h-4 w-4" />;

                return (
                  <div
                    key={s.label + i}
                    className="spec-pill flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2"
                  >
                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-neutral-200">
                      {ico}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-neutral-400">{s.label}</div>
                      <div className="text-xs font-semibold text-neutral-100">
                        {s.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="btn-ghost mt-3 w-full rounded-xl border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900"
            >
              {open ? "Ocultar especificaciones" : "Mostrar especificaciones completas"}
            </button>
          </div>
        ) : null}

        {/* Video (opcional, futuro) */}
        {videoUrl ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-800 bg-black/30">
            <div className="px-4 py-3 text-sm font-bold text-white">
              Video del armado
            </div>
            <video className="w-full" controls preload="metadata" src={videoUrl} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
