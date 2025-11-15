"use client";
import type { Product } from "./products";

export default function ProductDetail({ product }: { product: Product }) {
  return (
    <div className="rb-container">
      <div className="mx-auto mt-8 grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
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

          <div className="mt-6 flex gap-3">
            <button className="rounded-xl bg-lime-500 px-5 py-3 font-semibold text-black hover:bg-lime-400">
              Añadir al carrito
            </button>
            <button className="rounded-xl border border-neutral-700 px-5 py-3 font-semibold text-neutral-200 hover:bg-neutral-800">
              Consultar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
