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
        <div className="w-full overflow-x-auto overflow-y-hidden pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-nowrap gap-3">
            {safeImages.slice(0, 10).map((img, idx) => {
              const isActive = img === selectedImage;

              return (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  aria-label={`Ver imagen ${idx + 1} de ${productName}`}
                  className={`relative h-20 w-20 flex-[0_0_5rem] overflow-hidden rounded-xl border bg-gradient-to-b from-neutral-900 to-black transition-all duration-300 sm:h-24 sm:w-24 sm:flex-[0_0_6rem] lg:h-28 lg:w-28 lg:flex-[0_0_7rem] ${
                    isActive
                      ? "border-lime-400 ring-2 ring-lime-400/25 shadow-[0_0_24px_rgba(163,230,53,0.18)]"
                      : "border-neutral-700 hover:border-lime-400/60"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${productName} ${idx + 1}`}
                    fill
                    className="object-contain p-2"
                    sizes="112px"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}