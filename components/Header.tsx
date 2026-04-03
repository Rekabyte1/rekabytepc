"use client";

import Link from "next/link";
import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import CartDrawer from "./CartDrawer";
import GamesMegaMenu from "./GamesMegaMenu";
import CartCount from "./CartCount";
import ComponentsMenu from "./ComponentsMenu";
import GamingStreamingMenu from "./GamingStreamingMenu";

import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaShoppingCart,
  FaSearch,
} from "react-icons/fa";

type MobileMenuKey = "armados" | "componentes" | "gaming" | null;

export default function Header() {
  const router = useRouter();
  const { toggleCart } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState<MobileMenuKey>(null);

  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const calc = () => setIsMobile(window.innerWidth < 1024);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    setQuery(q);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(null);
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, isMobile]);

  const closeAllMenus = () => {
    setMenuOpen(false);
    setMobileOpen(null);
  };

  const openMenuSoft = () => {
    if (isMobile) return;
    if (timer) clearTimeout(timer);
    setMenuOpen(true);
  };

  const closeMenuSoft = () => {
    if (isMobile) return;
    if (timer) clearTimeout(timer);
    const t = setTimeout(() => setMenuOpen(false), 180);
    setTimer(t);
  };

  const toggleMenuMobile = () => {
    if (!isMobile) return;
    setMobileOpen((prev) => (prev === "armados" ? null : "armados"));
  };

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const q = query.trim();

    if (!q) {
      router.push("/productos");
      return;
    }

    closeAllMenus();
    router.push(`/productos?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <header ref={headerRef} className="rb-header rb-header-fixed">
        <div className="rb-topbar">
          <div className="rb-container rb-topbar-row">
            <div className="rb-topbar-left">
              <span className="pill">
                <FaEnvelope /> contacto@rekabyte.cl
              </span>
              <span className="pill">
                <FaMapMarkerAlt /> Punto de retiro, A pasos de metro Lo vial, San Miguel
              </span>
            </div>

            <div className="pill">
              <FaPhoneAlt className="text-green-400" /> +56 9 1234 5678
            </div>
          </div>
        </div>

        <div className="rb-main">
          <div className="rb-container rb-main-row flex items-center justify-between gap-4">
            <Link href="/" className="rb-brand flex items-center gap-3 shrink-0">
              <img
                src="/logo2.png"
                alt="RekaByte"
                className="h-12 md:h-40 w-auto object-contain"
              />
              <span className="rb-brand-name">RekaByte</span>
            </Link>

            <form className="rb-search" onSubmit={handleSearchSubmit}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca los mejores productos..."
                aria-label="Buscar productos"
              />
              <button type="submit" aria-label="Buscar">
                <FaSearch />
              </button>
            </form>

            <div className="rb-actions">
              <Link href="/cuenta" className="rb-action">
                <FaUser /> <span>Mi cuenta</span>
              </Link>
              <Link href="/contacto" className="rb-action">
                <FaPhoneAlt /> <span>Contacto</span>
              </Link>
              <button onClick={toggleCart} className="rb-action" type="button">
                <FaShoppingCart /> <span>Carrito</span> <CartCount />
              </button>
            </div>
          </div>
        </div>

        <nav className="rb-nav">
          <div className="rb-container rb-nav-row rb-nav-mobile-grid">
            <div
              className="rb-mega-wrap rb-mega-wrap-mobile"
              onMouseEnter={openMenuSoft}
              onMouseLeave={closeMenuSoft}
            >
              <button
                className={`rb-pill ${mobileOpen === "armados" ? "is-open" : ""}`}
                onClick={toggleMenuMobile}
                type="button"
              >
                Computadores Armados
              </button>

              {isMobile ? (
                mobileOpen === "armados" ? (
                  <GamesMegaMenu mobile onNavigate={closeAllMenus} />
                ) : null
              ) : menuOpen ? (
                <GamesMegaMenu onNavigate={closeAllMenus} />
              ) : null}
            </div>

            <ComponentsMenu
              isMobile={isMobile}
              mobileOpen={mobileOpen === "componentes"}
              onMobileToggle={() =>
                setMobileOpen((prev) =>
                  prev === "componentes" ? null : "componentes"
                )
              }
              onNavigate={closeAllMenus}
            />

            <GamingStreamingMenu
              isMobile={isMobile}
              mobileOpen={mobileOpen === "gaming"}
              onMobileToggle={() =>
                setMobileOpen((prev) => (prev === "gaming" ? null : "gaming"))
              }
              onNavigate={closeAllMenus}
            />
          </div>
        </nav>

        <CartDrawer />
      </header>

      {isMobile && mobileOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="rb-mobile-backdrop"
          onClick={closeAllMenus}
        />
      ) : null}

      <style jsx>{`
        .rb-header-fixed {
          position: relative;
          z-index: 80;
        }

        .rb-topbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rb-mobile-backdrop {
          position: fixed;
          inset: 0;
          z-index: 70;
          background: rgba(0, 0, 0, 0.58);
          border: 0;
          padding: 0;
          margin: 0;
        }

        .rb-nav-mobile-grid {
          position: relative;
          z-index: 90;
        }

        .rb-mega-wrap-mobile {
          position: relative;
          z-index: 95;
        }

        @media (max-width: 1023px) {
          .rb-topbar-row {
            display: grid;
            gap: 8px;
          }

          .rb-topbar-left {
            display: grid;
            gap: 8px;
          }

          .rb-main-row {
            display: grid !important;
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .rb-brand {
            justify-self: start;
          }

          .rb-actions {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
            width: 100%;
          }

          .rb-action {
            justify-content: center;
            min-width: 0;
            padding-left: 10px;
            padding-right: 10px;
          }

          .rb-action span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .rb-nav-mobile-grid {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
            align-items: start;
            overflow: visible;
          }

          .rb-mega-wrap-mobile {
            min-width: 0;
            overflow: visible;
          }

          :global(.rb-pill) {
            width: 100%;
            min-height: 52px;
            line-height: 1.2;
            text-align: center;
            justify-content: center;
            padding: 12px 10px;
            white-space: normal;
          }
        }
      `}</style>
    </>
  );
}