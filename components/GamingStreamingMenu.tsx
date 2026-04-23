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
    title: "Periféricos Gamer",
    links: [
      {
        label: "Audífonos Gamer",
        href: "/gaming-streaming/perifericos/audifonos",
      },
      {
        label: "Mouse Gamer",
        href: "/gaming-streaming/perifericos/mouse",
      },
      {
        label: "Mouse Pad Gamer",
        href: "/gaming-streaming/perifericos/mousepad",
      },
      {
        label: "Teclado Gamer",
        href: "/gaming-streaming/perifericos/teclado",
      },
      {
        label: "Kit Teclado + Mouse Gamer",
        href: "/gaming-streaming/perifericos/kit-teclado-mouse",
      },
    ],
  },
  {
    title: "Streaming",
    links: [
      { label: "Webcam", href: "/gaming-streaming/streaming/webcam" },
      {
        label: "Micrófono Streaming",
        href: "/gaming-streaming/streaming/microfono",
      },
    ],
  },
  {
    title: "Consolas y Controles",
    links: [
      {
        label: "Consolas y Accesorios",
        href: "/gaming-streaming/consolas/acc",
      },
    ],
  },
  {
    title: "Monitores Gamer",
    links: [{ label: "Monitor Gamer", href: "/gaming-streaming/monitores" }],
  },
];

export default function GamingStreamingMenu({
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
        Gaming y Streaming
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
              href="/gaming-streaming/perifericos"
              onClick={handleNavigate}
              className="rb-view-all"
            >
              Ver todos los periféricos
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

            .rb-mega-footer {
              padding: 0 16px 12px;
            }

            .rb-view-all {
              display: inline-block;
              color: #b6ff2e;
              font-size: 14px;
              font-weight: 900;
              text-decoration: none;
            }

            .rb-view-all:hover {
              color: #d9ff7a;
            }

            @media (min-width: 1024px) {
              .rb-mega-footer {
                padding: 0 20px 10px;
              }
            }
          `}</style>
        </div>
      ) : null}
    </div>
  );
}