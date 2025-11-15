// /components/GameBuildCard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Build } from "@/data/games";
import { BsBank2 } from "react-icons/bs";
import { FaBolt, FaRegHdd, FaCreditCard } from "react-icons/fa";
import { PiCpuFill } from "react-icons/pi";
import { MdMemory, MdPowerSettingsNew, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useCart } from "@/components/CartContext";
import { getStock, onInventoryChange } from "@/data/inventory";

type Props = { build: Build; gameTitle?: string };

const CLP = (n: number) =>
  n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

export default function GameBuildCard({ build, gameTitle }: Props) {
  // Carrusel: forzamos 3 imágenes
  const [idx, setIdx] = useState(0);
  const images = (() => {
    const srcs = Array.isArray(build.images) ? build.images.filter(Boolean) : [];
    let arr = srcs.slice(0, 3);
    if (arr.length === 0) arr = ["/pc1.jpg", "/pc1.jpg", "/pc1.jpg"];
    if (arr.length === 1) arr = [arr[0], arr[0], arr[0]];
    if (arr.length === 2) arr = [arr[0], arr[1], arr[1]];
    return arr;
  })();
  const prev = () => setIdx((v) => (v - 1 + images.length) % images.length);
  const next = () => setIdx((v) => (v + 1) % images.length);

  // Evitar hydration mismatch: no leer stock hasta que monte
  const [mounted, setMounted] = useState(false);
  const [liveStock, setLiveStock] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const update = () => setLiveStock(getStock(build.productSlug));
    update();
    return onInventoryChange(update);
  }, [mounted, build.productSlug]);

  const isOut = (liveStock ?? 0) <= 0;
  const isLow = (liveStock ?? 0) > 0 && (liveStock ?? 0) <= 3;

  // Toggle specs
  const [open, setOpen] = useState(false);

  // Carrito (NO toca inventario aquí)
  const { addItem, openCart } = useCart();
  const handleAdd = () => {
    if ((liveStock ?? 0) <= 0) return;
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

  // Iconos
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

  return (
    <article
      data-build-card
      className="group overflow-hidden rounded-2xl border border-neutral-800/60 bg-neutral-950/60 shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
    >
      {/* Imagen + carrusel */}
      <div className="relative w-full aspect-[16/10] bg-neutral-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[idx]}
          alt={build.title}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
          draggable={false}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <MdChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="siguiente"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <MdChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-5 rounded-full ${i === idx ? "bg-lime-400" : "bg-white/30"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Título + stock */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-white">{build.title}</h3>
          <div className="text-right">
            <div className="text-[10px] tracking-wide text-neutral-400">STOCK</div>
            <div
              className={`text-sm font-semibold ${
                isOut ? "text-red-400" : "text-neutral-100"
              }`}
              // Evita mismatch al hidratar
              suppressHydrationWarning
            >
              {mounted ? (isOut ? "AGOTADO" : liveStock) : "–"}
            </div>
            {mounted && isLow && !isOut && (
              <div className="text-[11px] font-semibold text-red-400">¡Últimas unidades!</div>
            )}
          </div>
        </div>

        {/* Precios */}
        <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl bg-neutral-900/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-neutral-300">
              <BsBank2 className="h-4 w-4 text-lime-400" />
              <span>Transferencia</span>
            </div>
            <div className="text-lg font-bold text-lime-400">{CLP(build.priceTransfer)}</div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-neutral-300">
              <FaCreditCard className="h-4 w-4 text-neutral-300" />
              <span>Otros medios de pago (Webpay / Mercado Pago)</span>
            </div>
            <div className="text-base font-semibold text-neutral-100">{CLP(build.priceCard)}</div>
          </div>
        </div>

        {/* Botón agregar */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!mounted || isOut}
            className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors ${
              !mounted || isOut
                ? "cursor-not-allowed bg-neutral-800/60 text-neutral-400"
                : "bg-lime-400 text-black hover:bg-lime-300"
            }`}
          >
            {!mounted ? "Cargando…" : isOut ? "Agotado" : "Agregar al carrito"}
          </button>
        </div>

        {/* Chip FPS */}
        {build.fpsInfo && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-neutral-300 text-sm">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-[11px] font-extrabold leading-none">
              {build.fpsInfo.split(" ")[0]}
              <span className="block text-[9px] leading-none">FPS</span>
            </span>
            <div>
              <div className="font-semibold text-white/90">{gameTitle ?? "Juego"}</div>
              <div className="text-xs text-neutral-400">{build.fpsInfo.replace(/^\S+\s/, "")}</div>
            </div>
          </div>
        )}

        {/* Especificaciones */}
        {build.specs?.length ? (
          <div className="mt-4">
            <ul className="grid gap-2">
              {(open ? build.specs : build.specs.slice(0, 6)).map((s, i) => {
                const iconKey = (Object.keys(iconFor) as Array<keyof typeof iconFor>).find((k) =>
                  s.label.startsWith(k)
                );
                const ico = iconKey ? iconFor[iconKey] : <FaBolt className="h-4 w-4" />;
                return (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-neutral-900/60 px-3 py-2 text-sm text-neutral-200"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-neutral-800 text-neutral-200">
                      {ico}
                    </span>
                    <div className="flex-1">
                      <span className="text-neutral-400">{s.label}: </span>
                      <span className="text-neutral-100">{s.value}</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-3 w-full rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm font-semibold text-neutral-200 transition-colors hover:bg-neutral-900"
            >
              {open ? "Ocultar especificaciones" : "Mostrar especificaciones completas"}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
