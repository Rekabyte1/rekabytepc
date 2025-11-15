"use client";
import Image from "next/image";
import { Product } from "@/lib/catalog";
import { useCart, CLP } from "@/components/CartContext";

const PLACEHOLDER = "/product-placeholder.png"; // pon un PNG en /public

type Props = { p?: Product | null };

export default function ProductCard({ p }: Props) {
  const { addItem } = useCart();

  // Si NO hay producto, mostramos una tarjeta neutra (evita crashes)
  if (!p) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 opacity-70">
        <div className="aspect-video overflow-hidden rounded-lg bg-neutral-950">
          <Image
            src={PLACEHOLDER}
            alt="Producto no disponible"
            width={800}
            height={450}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="mt-3">
          <h3 className="font-bold">Producto no disponible</h3>
          <div className="mt-1 text-sm text-neutral-400">—</div>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <div className="text-lime-400 font-extrabold">{CLP(0)}</div>
              <div className="text-xs text-neutral-400">Otros medios: {CLP(0)}</div>
            </div>
            <button className="rb-btn" disabled>Sin stock</button>
          </div>
        </div>
      </div>
    );
  }

  // Si hay producto, armamos el "cover" robusto
  const cover =
    p.image ??
    (p as any)?.images?.find?.((x: string | null | undefined) => !!x) ??
    PLACEHOLDER;

  const title = p.title || "Producto";
  const gpu = p.gpu?.toUpperCase?.() ?? "—";
  const cpu = p.cpu ? p.cpu.replaceAll("-", " ").toUpperCase() : "—";

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
      <div className="aspect-video overflow-hidden rounded-lg bg-neutral-950">
        <Image
          src={cover}
          alt={title}
          width={800}
          height={450}
          className="h-full w-full object-cover"
          // Si es URL externa y aún no está en next.config, evita optimización
          unoptimized={/^https?:\/\//.test(cover)}
        />
      </div>

      <div className="mt-3">
        <h3 className="font-bold">{title}</h3>

        <div className="mt-1 text-sm text-neutral-400">
          GPU: {gpu} • CPU: {cpu}
        </div>

        <div className="mt-2 flex items-end justify-between">
          <div>
            <div className="text-lime-400 font-extrabold">
              {CLP(p.priceTransfer)}
            </div>
            <div className="text-xs text-neutral-400">
              Otros medios: {CLP(p.priceCard)}
            </div>
          </div>

          <button
            className="rb-btn"
            onClick={() =>
              addItem(
                {
                  id: p.id,
                  name: title,
                  image: cover,
                  priceTransfer: p.priceTransfer,
                  priceCard: p.priceCard,
                },
                1
              )
            }
          >
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
