"use client";

import { useState } from "react";
import Image from "next/image";

type ProductImageGalleryProps = {
  images: string[];
  productName: string;
};

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const safeImages = images.filter(Boolean);
  const [selectedImage, setSelectedImage] = useState(safeImages[0] ?? "");

  if (!safeImages.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-neutral-800 bg-black/30 text-neutral-500">
        Sin imagen
      </div>
    );
  }

  return (
    <>
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
        <div className="grid grid-cols-4 gap-3">
          {safeImages.slice(0, 8).map((img, idx) => {
            const isActive = img === selectedImage;

            return (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`relative aspect-square overflow-hidden rounded-xl border bg-black/30 transition ${
                  isActive
                    ? "border-lime-400 ring-1 ring-lime-400"
                    : "border-neutral-800 hover:border-neutral-600"
                }`}
                aria-label={`Ver imagen ${idx + 1} de ${productName}`}
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
      )}
    </>
  );
}