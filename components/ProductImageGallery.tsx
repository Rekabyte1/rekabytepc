"use client";

import { useMemo, useState } from "react";
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

  if (!safeImages.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-neutral-700/70 bg-gradient-to-b from-neutral-900/80 to-black/80 text-neutral-500 shadow-[0_20px_55px_rgba(0,0,0,0.45)]">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Imagen principal */}
      <div className="relative mb-4 aspect-square overflow-hidden rounded-[1.35rem] border border-lime-400/15 bg-gradient-to-b from-neutral-900/80 via-neutral-950/85 to-black/90 shadow-[0_28px_75px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(163,230,53,0.14),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0.28)_100%)]" />
        <div className="pointer-events-none absolute inset-x-[12%] top-[30%] h-[42%] rounded-full bg-lime-400/12 blur-[72px]" />
        <Image
          src={selectedImage}
          alt={productName}
          fill
          className="object-contain p-3 md:p-4"
          priority
        />
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {safeImages.slice(0, 8).map((img, idx) => {
            const isActive = img === selectedImage;

            return (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => setSelectedImage(img)}
                aria-label={`Ver imagen ${idx + 1} de ${productName}`}
                className={`group relative aspect-square w-full overflow-hidden rounded-xl border bg-gradient-to-b from-neutral-900/75 to-black/85 transition-all duration-300 ${
                  isActive
                    ? "border-lime-400/80 ring-2 ring-lime-400/25 shadow-[0_0_0_1px_rgba(163,230,53,0.3),0_14px_30px_rgba(132,204,22,0.18)]"
                    : "border-neutral-700/70 hover:border-lime-400/45 hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
                }`}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(163,230,53,0.1),transparent_52%)] opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                <Image
                  src={img}
                  alt={`${productName} ${idx + 1}`}
                  fill
                  className="object-contain p-2"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}