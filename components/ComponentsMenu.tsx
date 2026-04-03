"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = {
  className?: string;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
  onNavigate?: () => void;
};

const COLS: Array<{
  title: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    title: "Procesador",
    links: [
      { label: "Procesador Intel", href: "/componentes/procesador/intel" },
      { label: "Procesador AMD", href: "/componentes/procesador/amd" },
    ],
  },
  {
    title: "Placa Madre",
    links: [
      { label: "Placa Intel", href: "/componentes/placa-madre/intel" },
      { label: "Placa AMD", href: "/componentes/placa-madre/amd" },
    ],
  },
  {
    title: "Memorias RAM",
    links: [{ label: "Memoria RAM PC", href: "/componentes/ram/pc" }],
  },
  {
    title: "Almacenamiento",
    links: [
      {
        label: "SSD Unidad Estado Sólido",
        href: "/componentes/almacenamiento/ssd",
      },
    ],
  },
  {
    title: "Tarjeta de Video",
    links: [
      { label: "Tarjeta Video Nvidia", href: "/componentes/gpu/nvidia" },
      { label: "Tarjeta Video AMD", href: "/componentes/gpu/amd" },
      { label: "Tarjeta de Video Intel", href: "/componentes/gpu/intel" },
    ],
  },
  {
    title: "Refrigeración y Ventilación",
    links: [
      {
        label: "Refrigeración Líquida",
        href: "/componentes/refrigeracion/liquida",
      },
      {
        label: "Disipador CPU",
        href: "/componentes/refrigeracion/disipador-cpu",
      },
      {
        label: "Ventilador Gabinete",
        href: "/componentes/refrigeracion/ventilador-gabinete",
      },
      {
        label: "Pasta Térmica",
        href: "/componentes/refrigeracion/pasta-termica",
      },
    ],
  },
  {
    title: "Fuente de Poder",
    links: [
      { label: "Fuentes de poder", href: "/componentes/fuente-poder/fuentes" },
      { label: "Cables de Poder", href: "/componentes/fuente-poder/cables" },
    ],
  },
  {
    title: "Gabinetes",
    links: [
      {
        label: "Full y Mid Tower",
        href: "/componentes/gabinetes/full-mid-tower",
      },
      {
        label: "Micro-ATX & Mini-ITX",
        href: "/componentes/gabinetes/matx-mini-itx",
      },
    ],
  },
];

export default function ComponentsMenu({
  className,
  isMobile = false,
  mobileOpen = false,
  onMobileToggle,
  onNavigate,
}: Props) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isMobile) setOpen(false);
  }, [isMobile]);

  const openSoft = () => {
    if (isMobile) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };

  const closeSoft = () => {
    if (isMobile) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 180);
  };

  const showPanel = isMobile ? mobileOpen : open;

  const handleNavigate = () => {
    onNavigate?.();
    setOpen(false);
  };

  return (
    <div
      className={["rb-mega-wrap", className].filter(Boolean).join(" ")}
      onMouseEnter={openSoft}
      onMouseLeave={closeSoft}
    >
      <button
        className={`rb-pill ${showPanel ? "is-open" : ""}`}
        onClick={isMobile ? onMobileToggle : undefined}
        type="button"
      >
        Componentes
      </button>

      {showPanel ? (
        <div className={isMobile ? "rb-mobile-panel" : "rb-mega-panel"}>
          <div className={isMobile ? "rb-mobile-grid" : "rb-mega-grid"}>
            {COLS.map((c) => (
              <div key={c.title} className="col">
                <h4>{c.title}</h4>
                <ul>
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} onClick={handleNavigate}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rb-mega-accent" />

          <style jsx>{`
            .rb-mobile-panel {
              position: absolute;
              left: 0;
              right: 0;
              top: calc(100% + 8px);
              z-index: 70;
              background: #070707;
              border: 1px solid #262626;
              border-radius: 16px;
              box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
              max-height: min(68vh, 560px);
              overflow: auto;
            }

            .rb-mobile-grid {
              display: grid;
              gap: 18px;
              padding: 16px;
            }

            .col h4 {
              color: #b6ff2e;
              font-size: 14px;
              font-weight: 900;
              margin: 0 0 10px;
            }

            .col ul {
              margin: 0;
              padding: 0;
              list-style: none;
              display: grid;
              gap: 10px;
            }

            .col :global(a) {
              color: #f5f5f5;
              font-size: 14px;
              font-weight: 600;
              text-decoration: none;
            }

            .col :global(a:hover) {
              color: #b6ff2e;
            }
          `}</style>
        </div>
      ) : null}
    </div>
  );
}