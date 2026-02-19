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
    links: [
      { label: "Memoria RAM PC", href: "/componentes/ram/pc" },
    ],
  },
  {
    title: "Almacenamiento",
    links: [
      { label: "SSD Unidad Estado Sólido", href: "/componentes/almacenamiento/ssd" },
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
      { label: "Refrigeración Líquida", href: "/componentes/refrigeracion/liquida" },
      { label: "Disipador CPU", href: "/componentes/refrigeracion/disipador-cpu" },
      { label: "Ventilador Gabinete", href: "/componentes/refrigeracion/ventilador-gabinete" },
      { label: "Pasta Térmica", href: "/componentes/refrigeracion/pasta-termica" },
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
      { label: "Full y Mid Tower", href: "/componentes/gabinetes/full-mid-tower" },
      { label: "Micro-ATX & Mini-ITX", href: "/componentes/gabinetes/matx-mini-itx" },
    ],
  },
];

export default function ComponentsMenu({ className }: Props) {
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
        Componentes
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

          <div className="mt-3 flex items-center justify-between gap-3 px-1">
            <Link
              href="/componentes"
              onClick={onNavigate}
              className="text-lime-300 font-extrabold text-sm hover:text-lime-200"
            >
             
            </Link>

            <span className="text-xs text-neutral-500">
              
            </span>
          </div>

          <div className="rb-mega-accent" />
        </div>
      ) : null}
    </div>
  );
}
