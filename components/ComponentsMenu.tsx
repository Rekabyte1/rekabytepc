// components/ComponentsMenu.tsx
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
    title: "Gabinetes",
    links: [
      { label: "Full y Mid Tower", href: "/componentes/gabinetes/full-mid-tower" },
      { label: "Micro-ATX & Mini-ITX", href: "/componentes/gabinetes/matx-mini-itx" },
    ],
  },
  {
    title: "Fuentes",
    links: [
      { label: "Fuentes de poder", href: "/componentes/fuente-poder/fuentes" },
      { label: "Cables de poder", href: "/componentes/fuente-poder/cables" },
    ],
  },
  {
    title: "Placas madre",
    links: [
      { label: "Placas madre", href: "/componentes/placa-madre" },
    ],
  },
  {
    title: "PC Gamer",
    links: [{ label: "Ver PC Gamer", href: "/modelos" }],
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

    <div className="rb-mega-footer">
      <Link
        href="/componentes"
        onClick={handleNavigate}
        className="rb-mega-all-btn"
      >
        Ver todos los componentes
      </Link>
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