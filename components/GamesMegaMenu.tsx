"use client";

import Link from "next/link";

type Props = {
  onNavigate?: () => void;
  mobile?: boolean;
};

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
                Explorar Setup Gamer
              </Link>
            </li>
          </ul>
          <p className="rb-copy">Encuentra periféricos según tu nivel de setup.</p>
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

        .rb-copy {
          margin-top: 12px;
          color: #a3a3a3;
          font-size: 13px;
          line-height: 1.5;
          max-width: 320px;
        }
      `}</style>
    </div>
  );
}