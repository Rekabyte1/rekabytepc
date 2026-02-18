"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartContext";
import CartDrawer from "./CartDrawer";
import GamesMegaMenu from "./GamesMegaMenu";
import CartCount from "./CartCount";
import ServicesMenu from "./ServicesMenu";

import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaShoppingCart,
  FaSearch,
} from "react-icons/fa";

export default function Header() {
  const { toggleCart } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

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
    setMenuOpen((prev) => !prev);
  };

  return (
    <header className="rb-header">
      {/* Topbar */}
      <div className="rb-topbar">
        <div className="rb-container rb-topbar-row">
          <div className="flex items-center">
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

      {/* Main */}
      <div className="rb-main">
        <div className="rb-container rb-main-row flex items-center justify-between gap-4 md:gap-8">
          
          {/* Logo */}
          <Link
            href="/"
            className="rb-brand flex items-center gap-3 shrink-0"
          >
            <img
              src="/logo2.png"
              alt="RekaByte"
              className="h-12 md:h-40 w-auto object-contain"
            />
            <span className="rb-brand-name hidden sm:inline">
              RekaByte
            </span>
          </Link>

          {/* Buscador */}
          <div className="rb-search">
            <input placeholder="Busca los mejores productos..." />
            <button aria-label="Buscar">
              <FaSearch />
            </button>
          </div>

          {/* Acciones */}
          <div className="rb-actions">
            <Link href="/cuenta" className="rb-action">
              <FaUser /> <span className="hidden sm:inline">Mi cuenta</span>
            </Link>

            <Link href="/contacto" className="rb-action">
              <FaPhoneAlt /> <span className="hidden sm:inline">Contacto</span>
            </Link>

            <button onClick={toggleCart} className="rb-action">
              <FaShoppingCart />
              <span className="hidden sm:inline">Carrito</span>
              <CartCount />
            </button>
          </div>
        </div>
      </div>

      {/* Nav + Mega */}
      <nav className="rb-nav">
        <div className="rb-container rb-nav-row">
          <div
            className="rb-mega-wrap"
            onMouseEnter={openMenuSoft}
            onMouseLeave={closeMenuSoft}
          >
            <button className="rb-pill" onClick={toggleMenuMobile}>
              Computadores Armados
            </button>

            {menuOpen ? (
              <GamesMegaMenu onNavigate={() => setMenuOpen(false)} />
            ) : null}
          </div>

          <Link href="/estaciones" className="rb-pill">
            Estaciones de trabajo
          </Link>

          <ServicesMenu />
        </div>
      </nav>

      <CartDrawer />
    </header>
  );
}
