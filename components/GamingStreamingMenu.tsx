"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  className?: string;
};

const COLS: Array<{
  title: string;
  links: Array<{ label: string; href: string }>;
}> = [

  {
    title: "Periféricos Gamer",
    links: [
      { label: "Audífonos Gamer", href: "/gaming-streaming/perifericos/audifonos" },
      { label: "Mouse Gamer", href: "/gaming-streaming/perifericos/mouse" },
      { label: "Mouse Pad Gamer", href: "/gaming-streaming/perifericos/mousepad" },
      { label: "Teclado Gamer", href: "/gaming-streaming/perifericos/teclado" },
      { label: "Kit Teclado + Mouse Gamer", href: "/gaming-streaming/perifericos/kit-teclado-mouse" },
    ],
  },

  {
    title: "Streaming",
    links: [
      { label: "Webcam", href: "/gaming-streaming/streaming/webcam" },
      { label: "Micrófono Streaming", href: "/gaming-streaming/streaming/microfono" },
      { label: "Iluminación", href: "/gaming-streaming/streaming/iluminacion" },
      { label: "Accesorios Streaming", href: "/gaming-streaming/streaming/accesorios" },
    ],
  },
 
  {
    title: "Consolas y Controles",
    links: [
      { label: "Consolas y Accesorios", href: "/gaming-streaming/consolas/acc" },
    ],
  },
  {
    title: "Monitores Gamer",
    links: [{ label: "Monitor Gamer", href: "/gaming-streaming/monitores" }],
  },
];

export default function GamingStreamingMenu({ className }: Props) {
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const calc = () => setIsMobile(window.innerWidth < 1024);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const openSoft = () => {
    if (isMobile) return;
    if (timer) clearTimeout(timer);
    setOpen(true);
  };

  const closeSoft = () => {
    if (isMobile) return;
    if (timer) clearTimeout(timer);
    const t = setTimeout(() => setOpen(false), 180);
    setTimer(t);
  };

  const toggleMobile = () => {
    if (!isMobile) return;
    setOpen((p) => !p);
  };

  const onNavigate = () => setOpen(false);

  return (
    <div
      className={["rb-mega-wrap", className].filter(Boolean).join(" ")}
      onMouseEnter={openSoft}
      onMouseLeave={closeSoft}
    >
      <button className="rb-pill" onClick={toggleMobile}>
        Gaming y Streaming
      </button>

      {open ? (
        <div className="rb-mega-panel">
          <div className="rb-mega-grid">
            {COLS.map((c) => (
              <div key={c.title} className="col">
                <h4>{c.title}</h4>
                <ul>
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} onClick={onNavigate}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-3 px-1">
            <Link
              href="/gaming-streaming"
              onClick={onNavigate}
              className="text-lime-300 font-extrabold text-sm hover:text-lime-200"
            >
              
            </Link>
          </div>

          <div className="rb-mega-accent" />
        </div>
      ) : null}
    </div>
  );
}
