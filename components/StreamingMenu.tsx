// components/StreamingMenu.tsx
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

const LINKS: Array<{ label: string; href: string }> = [
  { label: "Micrófonos", href: "/gaming-streaming/streaming/microfono" },
  { label: "Webcams", href: "/gaming-streaming/streaming/webcam" },
];

export default function StreamingMenu({
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
        Streaming
      </button>

      {showPanel ? (
        <div className={isMobile ? "rb-mobile-panel" : "rb-mega-panel"}>
          <div className={isMobile ? "rb-mobile-grid" : "rb-mega-grid"}>
            <div className="col">
              <h4>Streaming</h4>
              <ul>
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={handleNavigate}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rb-mega-footer">
            <Link
              href="/gaming-streaming/streaming"
              onClick={handleNavigate}
              className="rb-view-all"
            >
              Ver todo streaming
            </Link>
          </div>

          <div className="rb-mega-accent" />
        </div>
      ) : null}
    </div>
  );
}