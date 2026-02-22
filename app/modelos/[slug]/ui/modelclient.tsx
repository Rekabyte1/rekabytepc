"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import type { Build } from "@/data/games";

type Props = {
  build: Build;
  gameTitle?: string;
  gameSlug?: string;
};

const CLP = (n: number) =>
  n.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

type LiveProduct = {
  slug: string;
  name?: string | null;
  title?: string | null;
  priceTransfer?: number | null;
  priceCard?: number | null;
  stock?: number | null;
  imageUrl?: string | null;
  isActive?: boolean | null;
};

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function ModelClient({ build, gameTitle, gameSlug }: Props) {
  // ===== Galería (máx 3) =====
  const [idx, setIdx] = useState(0);

  const images = useMemo(() => {
    const srcs = Array.isArray(build.images) ? build.images.filter(Boolean) : [];
    let arr = srcs.slice(0, 3) as string[];
    if (arr.length === 0) arr = ["/pc1.jpg", "/pc1.jpg", "/pc1.jpg"];
    if (arr.length === 1) arr = [arr[0], arr[0], arr[0]];
    if (arr.length === 2) arr = [arr[0], arr[1], arr[1]];
    return arr;
  }, [build.images]);

  // ===== Live (BD) opcional =====
  const [mounted, setMounted] = useState(false);
  const [live, setLive] = useState<LiveProduct | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/by-slugs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slugs: [build.productSlug] }),
        });
        const data = await res.json().catch(() => ({}));
        const p = Array.isArray(data?.items) ? data.items[0] : null;
        if (!cancelled) setLive(p ?? null);
      } catch {
        if (!cancelled) setLive(null);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [mounted, build.productSlug]);

  const title = (live?.name as string) || (live?.title as string) || build.title;

  const priceTransfer =
    typeof live?.priceTransfer === "number" ? live.priceTransfer : build.priceTransfer;

  const priceCard =
    typeof live?.priceCard === "number" ? live.priceCard : build.priceCard;

  const stock =
    typeof live?.stock === "number" ? live.stock : (build as any)?.stock ?? 0;

  const isOut = (stock ?? 0) <= 0;
  const isLow = (stock ?? 0) > 0 && (stock ?? 0) <= 3;

  const cover = live?.imageUrl || images[0] || "/pc1.jpg";

  // ===== Carrito =====
  const { addItem, openCart } = useCart();
  const handleAdd = () => {
    if ((stock ?? 0) <= 0) return;
    addItem(
      {
        id: build.productSlug,
        name: title,
        image: cover,
        priceTransfer: priceTransfer ?? 0,
        priceCard: priceCard ?? 0,
      },
      1
    );
    openCart();
  };

  // ===== Video (futuro) =====
  const videoUrl = (build as any)?.videoUrl as string | undefined;

  return (
    <main className="rb-container" data-model-page="1">
      {/* HERO */}
      <section className="rb-model-hero">
        <div className="rb-model-hero__bg" />
        <div className="rb-model-hero__inner">
          <div className="rb-model-breadcrumb">
            <span className="rb-chip">MODELO</span>
            {gameTitle ? (
              <span className="rb-muted">
                Recomendado para <b className="rb-accent">{gameTitle}</b>
              </span>
            ) : (
              <span className="rb-muted">PC armada lista para comprar</span>
            )}
          </div>

          <h1 className="rb-model-title">{title}</h1>

          <div className="rb-model-sub">
            {build.fpsInfo ? <span>{build.fpsInfo}</span> : null}
            {build.fpsInfo ? <span className="rb-dot">•</span> : null}
            <span className="rb-muted">Envíos a todo Chile</span>
          </div>

          <div className="rb-model-badges">
            <span className="rb-badge">Garantía</span>
            <span className="rb-badge">Armado profesional</span>
            <span className="rb-badge">Soporte</span>
          </div>
        </div>
      </section>

      {/* LAYOUT */}
      <section className="rb-model-grid">
        {/* GALERÍA */}
        <div className="rb-card rb-gallery">
          <div className="rb-gallery__main">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[idx]} alt={title} className="rb-gallery__img" draggable={false} />

            <div className="rb-stockpill" suppressHydrationWarning>
              {!mounted ? (
                <>Stock: —</>
              ) : isOut ? (
                <span className="rb-stockpill--out">Agotado</span>
              ) : (
                <>
                  <span>Stock: {stock}</span>
                  {isLow ? <span className="rb-stockpill__low">Últimas</span> : null}
                </>
              )}
            </div>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setIdx((v) => (v - 1 + images.length) % images.length)}
                  className="rb-gallery__nav rb-gallery__nav--l"
                  aria-label="Anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setIdx((v) => (v + 1) % images.length)}
                  className="rb-gallery__nav rb-gallery__nav--r"
                  aria-label="Siguiente"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>

          <div className="rb-gallery__thumbs">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setIdx(i)}
                className={cx("rb-thumbbtn", i === idx && "rb-thumbbtn--active")}
                aria-label={`Ver imagen ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="rb-thumbimg" />
              </button>
            ))}
          </div>
        </div>

        {/* COMPRA */}
        <aside className="rb-card rb-buy">
          <div className="rb-buy__top">
            <div>
              <div className="rb-buy__kicker">Compra segura</div>
              <div className="rb-buy__brand">RekaByte</div>
            </div>

            <div className="rb-buy__trust">
              <span className="rb-trustdot" />
              <span>Pago protegido</span>
            </div>
          </div>

          <div className="rb-pricebox">
            <div className="rb-pricerow">
              <div className="rb-priceleft">
                <div className="rb-label">Transferencia</div>
                <div className="rb-muted-xs">Mejor precio</div>
              </div>
              <div className="rb-priceright rb-accent">
                {typeof priceTransfer === "number" ? CLP(priceTransfer) : "—"}
              </div>
            </div>

            <div className="rb-divider" />

            <div className="rb-pricerow">
              <div className="rb-priceleft">
                <div className="rb-label">Otros medios</div>
                <div className="rb-muted-xs">Webpay / MercadoPago</div>
              </div>
              <div className="rb-priceright">
                {typeof priceCard === "number" ? CLP(priceCard) : "—"}
              </div>
            </div>

            <div className="rb-muted-xs mt8">
              * Precio final puede variar por medio de pago y envío.
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!mounted || isOut}
            className={cx("rb-cta", (!mounted || isOut) && "rb-cta--disabled")}
          >
            {!mounted ? "Cargando…" : isOut ? "Agotado" : "Agregar al carrito"}
          </button>

          <div className="rb-benefits">
            <div className="rb-benefit">
              <div className="rb-benefit__t">Armado profesional</div>
              <div className="rb-benefit__d">Cableado y pruebas</div>
            </div>
            <div className="rb-benefit">
              <div className="rb-benefit__t">Garantía</div>
              <div className="rb-benefit__d">Soporte post-venta</div>
            </div>
            <div className="rb-benefit">
              <div className="rb-benefit__t">Envíos</div>
              <div className="rb-benefit__d">A todo Chile</div>
            </div>
          </div>

          {gameSlug ? (
            <Link href={`/juegos/${gameSlug}`} className="rb-back">
              Volver al juego
            </Link>
          ) : null}
        </aside>
      </section>

      {/* DESCRIPCIÓN (para SEO) */}
      <section className="rb-card rb-section">
        <h2 className="rb-h2">Descripción</h2>
        <p className="rb-p">
          {title} es una configuración pensada para {gameTitle ?? "tu uso"}.
          Incluye componentes seleccionados para estabilidad, temperaturas y una experiencia sólida.
           agregar una descripción larga por build para SEO (ideal: 120–200 palabras).
        </p>
      </section>

      {/* ESPECIFICACIONES */}
      <section className="rb-card rb-section">
        <h2 className="rb-h2">Especificaciones completas</h2>

        <div className="rb-specgrid">
          {(build.specs ?? []).map((s, i) => (
            <div key={s.label + i} className="rb-spec">
              <div className="rb-spec__k">{s.label}</div>
              <div className="rb-spec__v">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VIDEO */}
      <section className="rb-card rb-section rb-mb">
        <h2 className="rb-h2">Video del armado</h2>
        <p className="rb-p">
           video, aquí quedará incrustado para aumentar confianza y conversión.
        </p>

        {videoUrl ? (
          <div className="rb-video">
            <video controls className="rb-video__el">
              <source src={videoUrl} />
            </video>
          </div>
        ) : (
          <div className="rb-empty">
            (Aún sin video) — luego agregas <code>videoUrl</code> en tu build y aparece automáticamente.
          </div>
        )}
      </section>
    </main>
  );
}
