// components/GamesMegaMenu.tsx
"use client";

import Link from "next/link";

type Props = {
  onNavigate?: () => void;
  mobile?: boolean;
};

const SETUP_LINKS = [
  { label: "Spawn", href: "/setup-gamer?tier=spawn" },
  { label: "Loadout", href: "/setup-gamer?tier=loadout" },
  { label: "Clutch", href: "/setup-gamer?tier=clutch" },
];

export default function GamesMegaMenu({
  onNavigate,
  mobile = false,
}: Props) {
  function handleClick() {
    onNavigate?.();
  }

  return (
    <div className={mobile ? "rb-mobile-panel" : "rb-mega-panel"}>
      <div className={mobile ? "rb-mobile-grid" : "rb-mega-grid"}>
        <div className="col">
          <h4>Setup Gamer</h4>
          <ul>
            <li>
              <Link href="/setup-gamer" onClick={handleClick}>
                Explorar Setup Gamer (temporal)
              </Link>
            </li>
          </ul>
        </div>


        <div className="col">
          <h4>Niveles</h4>
          <ul>
            {SETUP_LINKS.map((item) => (
              <li key={item.label}>
                <Link href={item.href} onClick={handleClick}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col">
          <h4>Estado</h4>
          <ul>
            <li>
              <Link href="/setup-gamer" onClick={handleClick}>
                Selector definitivo en Etapa B
              </Link>
            </li>
          </ul>
        </div>


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
  );
}