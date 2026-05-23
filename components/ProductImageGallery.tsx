"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";

type ProductImageGalleryProps = {
  images: string[];
  productName: string;
};

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [selectedImage, setSelectedImage] = useState(safeImages[0] ?? "");
  const thumbsRef = useRef<HTMLDivElement | null>(null);

  const scrollThumbs = (direction: "left" | "right") => {
    const node = thumbsRef.current;
    if (!node) return;

    node.scrollBy({
      left: direction === "left" ? -240 : 240,
      behavior: "smooth",
    });
  };

  if (!safeImages.length) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-neutral-700/70 bg-black text-neutral-500 md:h-[440px] lg:aspect-square lg:h-auto">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="relative mb-4 h-[360px] overflow-hidden rounded-2xl border border-lime-400/20 bg-gradient-to-b from-neutral-900 via-black to-black shadow-[0_28px_75px_rgba(0,0,0,0.55)] md:h-[440px] lg:aspect-square lg:h-auto">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(163,230,53,0.14),transparent_48%)]" />

        <Image
          src={selectedImage}
          alt={productName}
          fill
          className="object-contain p-3 md:p-4"
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
      </div>

      {safeImages.length > 1 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollThumbs("left")}
            aria-label="Ver miniaturas anteriores"
            className="absolute left-1 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-lime-400/30 bg-black/75 p-2 text-lime-300 transition hover:border-lime-400/60 hover:text-lime-200 lg:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M11.78 14.78a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 111.06 1.06L8.06 10l3.72 3.72a.75.75 0 010 1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => scrollThumbs("right")}
            aria-label="Ver miniaturas siguientes"
            className="absolute right-1 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-lime-400/30 bg-black/75 p-2 text-lime-300 transition hover:border-lime-400/60 hover:text-lime-200 lg:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.22 5.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 11-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 rounded-l-xl bg-gradient-to-r from-black/65 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 rounded-r-xl bg-gradient-to-l from-black/65 to-transparent" />

          <div
            ref={thumbsRef}
            className="w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex flex-nowrap gap-2.5 md:gap-3">
              {safeImages.map((img, idx) => {
                const isActive = img === selectedImage;

                return (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    aria-label={`Ver imagen ${idx + 1} de ${productName}`}
                    className={`relative h-16 w-16 snap-start flex-[0_0_4rem] overflow-hidden rounded-lg border bg-gradient-to-b from-neutral-900 to-black transition-all duration-300 sm:h-[4.5rem] sm:w-[4.5rem] sm:flex-[0_0_4.5rem] md:h-[5rem] md:w-[5rem] md:flex-[0_0_5rem] lg:h-[5.25rem] lg:w-[5.25rem] lg:flex-[0_0_5.25rem] ${
                      isActive
                        ? "border-lime-400 ring-2 ring-lime-400/25 shadow-[0_0_20px_rgba(163,230,53,0.18)]"
                        : "border-neutral-700 hover:border-lime-400/60"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${productName} ${idx + 1}`}
                      fill
                      className="object-contain p-1.5 md:p-2"
                      sizes="84px"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}