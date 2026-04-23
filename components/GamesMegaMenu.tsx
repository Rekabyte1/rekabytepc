"use client";

import Link from "next/link";

type Props = {
  onNavigate?: () => void;
  mobile?: boolean;
};

const GAME_LINKS = [
  { label: "Counter-Strike 2", slug: "counter-strike-2" },
  { label: "Call of Duty: Warzone", slug: "call-of-duty-warzone" },
  { label: "Minecraft", slug: "minecraft" },
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
          <h4>Equipos y Setup</h4>
          <ul>
            <li>
              <Link href="/modelos" onClick={handleClick}>
                Ver colección completa
              </Link>
            </li>
          </ul>
        </div>


        <div className="col">
          <h4>Explorar por juego</h4>
          <ul>
            {GAME_LINKS.map((g) => (
              <li key={g.slug}>
                <Link href={`/juegos/${g.slug}`} onClick={handleClick}>
                  {g.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/allgames" onClick={handleClick}>
                Ver todos los juegos
              </Link>
            </li>
          </ul>
        </div>

        <div className="col">
          <h4>Plataforma</h4>
          <ul>
            <li>
              <Link href="/procesador/intel" onClick={handleClick}>
                Intel
              </Link>
            </li>
            <li>
              <Link href="/procesador/amd-ryzen" onClick={handleClick}>
                AMD Ryzen
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