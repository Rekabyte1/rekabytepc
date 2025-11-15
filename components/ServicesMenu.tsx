// components/ServicesMenu.tsx
"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { FiTool } from "react-icons/fi";

export default function ServicesMenu() {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const openSoft = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };
  const closeSoft = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 160);
  };

  return (
    <div
      className="rb-mega-wrap relative"
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
        aria-expanded={open}
      >
        Servicios
      </button>

      {open && (
        <div
          className="
            rb-mega
            absolute left-0 top-[calc(100%+8px)] z-[70]
            w-[360px] rounded-2xl border border-neutral-800
            bg-neutral-950 shadow-[0_10px_40px_rgba(0,0,0,0.45)]
          "
          style={{ backgroundColor: "rgb(10,10,10)" }} /* fuerza opaco */
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

          {/* franja inferior como el mega menú principal */}
          <div className="h-[3px] w-full rounded-b-2xl bg-lime-400" />
        </div>
      )}
    </div>
  );
}
