"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type CarouselItem = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  shortDescription: string | null;
  imageUrl: string | null;
  stock: number | null;
  price: number;
  priceTransfer: number | null;
  priceCard: number | null;
  badge: string | null;
};

type Props = {
  items: CarouselItem[];
  hrefBase?: string;
  fallbackBrand: string;
  fallbackDescription: string;
  emptyText: string;
};

function clp(value: number | null | undefined) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function PremiumHorizontalCarousel({
  items,
  hrefBase = "/producto",
  fallbackBrand,
  fallbackDescription,
  emptyText,
}: Props) {
  const CARD_WIDTH = 344; // 320 card + 24 gap aprox
  const clonesToShow = items.length > 1 ? Math.min(items.length, 4) : 1;

  const extendedItems = useMemo(() => {
    if (items.length === 0) return [];
    if (items.length === 1) return items;

    const headClones = items.slice(-clonesToShow);
    const tailClones = items.slice(0, clonesToShow);

    return [...headClones, ...items, ...tailClones];
  }, [items, clonesToShow]);

  const [currentIndex, setCurrentIndex] = useState(clonesToShow);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isMovingRef = useRef(false);

  useEffect(() => {
    if (items.length <= 1) {
      setCurrentIndex(0);
      setIsReady(true);
      return;
    }

    setCurrentIndex(clonesToShow);
    setIsAnimating(false);

    const raf = requestAnimationFrame(() => {
      setIsReady(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [items.length, clonesToShow]);

  const handleNext = () => {
    if (items.length <= 1 || isMovingRef.current) return;
    isMovingRef.current = true;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (items.length <= 1 || isMovingRef.current) return;
    isMovingRef.current = true;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    if (items.length <= 1) {
      isMovingRef.current = false;
      return;
    }

    let nextIndex = currentIndex;
    let needsReset = false;

    if (currentIndex >= items.length + clonesToShow) {
      nextIndex = clonesToShow;
      needsReset = true;
    } else if (currentIndex < clonesToShow) {
      nextIndex = items.length + clonesToShow - 1;
      needsReset = true;
    }

    if (needsReset) {
      setIsAnimating(false);
      setCurrentIndex(nextIndex);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
          isMovingRef.current = false;
        });
      });
    } else {
      isMovingRef.current = false;
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-neutral-800 bg-neutral-950/55 p-6 text-neutral-300">
        {emptyText}
      </div>
    );
  }

  if (items.length === 1) {
    const product = items[0];
    const transferPrice =
      product.priceTransfer && product.priceTransfer > 0
        ? product.priceTransfer
        : product.price;
    const hasStock = (product.stock ?? 0) > 0;

    return (
      <div className="flex">
        <Link
          href={`${hrefBase}/${product.slug}`}
          className="group min-w-[320px] max-w-[320px] overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/70 shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-lime-400/30 hover:bg-neutral-950"
        >
          <div className="relative aspect-[4/3] bg-black/30">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                Sin imagen
              </div>
            )}

            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {product.badge ? (
                <span className="rounded-full bg-lime-400 px-3 py-1 text-xs font-extrabold text-black shadow-[0_0_20px_rgba(163,230,53,0.18)]">
                  {product.badge}
                </span>
              ) : null}

              <span
                className={[
                  "rounded-full border px-3 py-1 text-xs font-extrabold",
                  hasStock
                    ? "border-lime-400/20 bg-lime-400/10 text-lime-300"
                    : "border-red-500/20 bg-red-500/10 text-red-300",
                ].join(" ")}
              >
                {hasStock ? `Stock: ${product.stock ?? 0}` : "Agotado"}
              </span>
            </div>
          </div>

          <div className="p-5">
            <p className="text-xs font-extrabold uppercase tracking-wide text-neutral-400">
              {product.brand || fallbackBrand}
            </p>

            <h3 className="mt-2 text-lg font-black text-white">
              {product.name}
            </h3>

            <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-300">
              {product.shortDescription || fallbackDescription}
            </p>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <div className="text-xs text-neutral-400">Transferencia</div>
                <div className="text-2xl font-black text-lime-400">
                  {clp(transferPrice)}
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Otros medios: {clp(product.priceCard || product.price)}
                </div>
              </div>

              <span className="rounded-xl border border-neutral-700 px-3 py-2 text-xs font-extrabold text-neutral-200 transition group-hover:border-lime-400/30 group-hover:text-white">
                Ver producto
              </span>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Anterior"
        onClick={handlePrev}
        className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-950/90 text-neutral-200 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-lime-400/30 hover:text-lime-300 lg:flex"
      >
        <FaChevronLeft className="h-4 w-4" />
      </button>

      <button
        type="button"
        aria-label="Siguiente"
        onClick={handleNext}
        className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-950/90 text-neutral-200 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-lime-400/30 hover:text-lime-300 lg:flex"
      >
        <FaChevronRight className="h-4 w-4" />
      </button>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-16 bg-gradient-to-r from-black/70 to-transparent lg:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-16 bg-gradient-to-l from-black/70 to-transparent lg:block" />

      <div className="overflow-hidden">
        <div
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          className="flex gap-6"
          style={{
            transform: isReady
              ? `translateX(-${currentIndex * CARD_WIDTH}px)`
              : "translateX(0px)",
            transition: isAnimating ? "transform 450ms ease" : "none",
            willChange: "transform",
          }}
        >
          {extendedItems.map((product, index) => {
            const transferPrice =
              product.priceTransfer && product.priceTransfer > 0
                ? product.priceTransfer
                : product.price;

            const hasStock = (product.stock ?? 0) > 0;

            return (
              <Link
                key={`${product.id}-${index}`}
                href={`${hrefBase}/${product.slug}`}
                className="group min-w-[320px] max-w-[320px] shrink-0 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/70 shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-lime-400/30 hover:bg-neutral-950"
              >
                <div className="relative aspect-[4/3] bg-black/30">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                      Sin imagen
                    </div>
                  )}

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {product.badge ? (
                      <span className="rounded-full bg-lime-400 px-3 py-1 text-xs font-extrabold text-black shadow-[0_0_20px_rgba(163,230,53,0.18)]">
                        {product.badge}
                      </span>
                    ) : null}

                    <span
                      className={[
                        "rounded-full border px-3 py-1 text-xs font-extrabold",
                        hasStock
                          ? "border-lime-400/20 bg-lime-400/10 text-lime-300"
                          : "border-red-500/20 bg-red-500/10 text-red-300",
                      ].join(" ")}
                    >
                      {hasStock ? `Stock: ${product.stock ?? 0}` : "Agotado"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-neutral-400">
                    {product.brand || fallbackBrand}
                  </p>

                  <h3 className="mt-2 text-lg font-black text-white">
                    {product.name}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-300">
                    {product.shortDescription || fallbackDescription}
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <div className="text-xs text-neutral-400">
                        Transferencia
                      </div>
                      <div className="text-2xl font-black text-lime-400">
                        {clp(transferPrice)}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">
                        Otros medios: {clp(product.priceCard || product.price)}
                      </div>
                    </div>

                    <span className="rounded-xl border border-neutral-700 px-3 py-2 text-xs font-extrabold text-neutral-200 transition group-hover:border-lime-400/30 group-hover:text-white">
                      Ver producto
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}