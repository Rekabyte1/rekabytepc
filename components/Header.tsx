// components/Header.tsx
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

/**
 * Header completo y sincronizado:
 * - Topbar con espaciado extra entre íconos/textos
 * - Logo + buscador + acciones
 * - Mega menú solo en “Computadores Armados” (con retardo suave)
 * - Carrito (abre drawer desde la derecha)
 */
export default function Header() {
  const { toggleCart } = useCart();

  // controla apertura del mega menú con un leve retardo para evitar “se cierra altiro”
  const [menuOpen, setMenuOpen] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const openMenuSoft = () => {
    if (timer) clearTimeout(timer);
    setMenuOpen(true);
  };
  const closeMenuSoft = () => {
    if (timer) clearTimeout(timer);
    const t = setTimeout(() => setMenuOpen(false), 180);
    setTimer(t);
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
              <FaMapMarkerAlt /> Punto de retiro, Real Audiencia 1170, San Miguel
            </span>
          </div>
          <div className="pill">
            <FaPhoneAlt className="text-green-400" /> +56 9 1234 5678
          </div>
        </div>
      </div>

        {/* Main row */} 
        <div className="rb-main">
        <div className="rb-container rb-main-row">
          {/* Logo */} <Link href="/" className="rb-brand">
            <img src="/Logo2.png" alt="RekaByte" className="h-40 w-auto object-contain" 
              /> <span className="rb-brand-name">RekaByte</span> </Link>

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
              <FaUser /> <span>Mi cuenta</span>
            </Link>
            <Link href="/contacto" className="rb-action">
              <FaPhoneAlt /> <span>Contacto</span>
            </Link>
            <button onClick={toggleCart} className="rb-action">
              <FaShoppingCart /> <span>Carrito</span> <CartCount />
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
            <button className="rb-pill">Computadores Armados</button>
            {menuOpen ? <GamesMegaMenu /> : null}
          </div>

          <Link href="/estaciones" className="rb-pill">
            Estaciones de trabajo
          </Link>

          {/* Menú desplegable de Servicios */}
          <ServicesMenu />
        </div>
      </nav>

      {/* Drawer del carrito */}
      <CartDrawer />
    </header>
  );
}
