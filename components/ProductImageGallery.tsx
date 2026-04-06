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
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-neutral-800 bg-black/30 text-neutral-500">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Imagen principal */}
      <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl border border-neutral-800 bg-black/30">
        <Image
          src={selectedImage}
          alt={productName}
          fill
          className="object-contain"
          priority
        />
      </div>

      {safeImages.length > 1 && (
        <>
          {/* MOBILE: fila horizontal */}
          <div className="md:hidden">
            <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {safeImages.map((img, idx) => {
                const isActive = img === selectedImage;

                return (
                  <div
                    key={`${img}-${idx}`}
                    className="shrink-0"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      aria-label={`Ver imagen ${idx + 1} de ${productName}`}
                      className={`relative h-24 w-24 overflow-hidden rounded-xl border bg-black/30 transition ${
                        isActive
                          ? "border-lime-400 ring-1 ring-lime-400"
                          : "border-neutral-800 hover:border-neutral-600"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${productName} ${idx + 1}`}
                        fill
                        className="object-contain"
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DESKTOP: grilla */}
          <div className="hidden grid-cols-4 gap-3 md:grid">
            {safeImages.slice(0, 8).map((img, idx) => {
              const isActive = img === selectedImage;

              return (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  aria-label={`Ver imagen ${idx + 1} de ${productName}`}
                  className={`relative aspect-square overflow-hidden rounded-xl border bg-black/30 transition ${
                    isActive
                      ? "border-lime-400 ring-1 ring-lime-400"
                      : "border-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${productName} ${idx + 1}`}
                    fill
                    className="object-contain"
                  />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}