// components/ServicesMenu.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiTool } from "react-icons/fi";

export default function ServicesMenu() {
  // Estados separados para desktop y mobile (simple / predecible)
  const [openDesk, setOpenDesk] = useState(false);
  const [openMob, setOpenMob] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mobileWrapRef = useRef<HTMLDivElement | null>(null);

  // ---------- Desktop (hover/focus) ----------
  const openSoft = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpenDesk(true);
  };
  const closeSoft = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpenDesk(false), 160);
  };

  // ---------- Mobile: cerrar al tocar fuera ----------
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!openMob) return;
      const target = e.target as Node;
      if (mobileWrapRef.current && !mobileWrapRef.current.contains(target)) {
        setOpenMob(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [openMob]);

  // Contenido del menú (reutilizado)
  const MenuPanel = ({ className = "" }: { className?: string }) => (
    <div
      className={
        `
          rb-mega rounded-2xl border border-neutral-800
          bg-neutral-950 shadow-[0_10px_40px_rgba(0,0,0,0.45)]
        ` + " " + className
      }
      style={{ backgroundColor: "rgb(10,10,10)" }} // fuerza opaco
      role="menu"
    >
      <div className="px-5 py-4">
        <ul className="m-0 list-none p-0 text-sm">
          <li>
            <Link
              href="/servicios/mantenimiento"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-200 hover:bg-neutral-900 hover:text-white"
              role="menuitem"
            >
              <FiTool className="h-4 w-4 text-lime-400" />
              <span className="font-semibold">Mantenimiento técnico</span>
            </Link>
          </li>
        </ul>
      </div>
      <div className="h-[3px] w-full rounded-b-2xl bg-lime-400" />
    </div>
  );

  return (
    <div className="relative">
      {/* ------- Desktop (>= md): hover/focus) ------- */}
      <div
        className="relative hidden md:block"
        onMouseEnter={openSoft}
        onMouseLeave={closeSoft}
        onFocus={openSoft}
        onBlur={closeSoft}
      >
        <button
          type="button"
          className="rb-pill"
          onMouseDown={(e) => e.preventDefault()}
          aria-haspopup="menu"
          aria-expanded={openDesk}
        >
          Servicios
        </button>

        {openDesk && (
          <MenuPanel
            className="
              absolute left-0 top-[calc(100%+8px)] z-[70]
              w-[360px] max-w-[95vw]
            "
          />
        )}
      </div>

      {/* ------- Mobile (< md): tap para abrir ------- */}
      <div ref={mobileWrapRef} className="relative md:hidden">
        <button
          type="button"
          className="rb-pill"
          onClick={() => setOpenMob((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={openMob}
        >
          Servicios
        </button>

        {openMob && (
          <MenuPanel
            className="
              absolute left-2 right-2 top-[calc(100%+6px)] z-[70]
            "
          />
        )}
      </div>
    </div>
  );
}
