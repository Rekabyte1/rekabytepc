// components/ProductDetail.tsx
"use client";

import AddToCartButton from "./AddToCartButton";
import type { Product } from "./products";

export default function ProductDetail({ product }: { product: Product }) {
  return (
    <div className="rb-container">
      <div className="mx-auto mt-8 grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            {product.name}
          </h1>

          <p className="mt-2 text-neutral-300">{product.shortDesc}</p>

          <div className="mt-4 text-2xl font-bold text-lime-400">
            {product.priceText}
          </div>

          {product.specs?.length ? (
            <ul className="mt-4 space-y-1 text-neutral-200">
              {product.specs.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <AddToCartButton slug={product.slug} name={product.name} />

            <AddToCartButton
              slug={product.slug}
              name={product.name}
              mode="buy_now"
              className="!bg-lime-400 !text-black hover:!bg-lime-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}