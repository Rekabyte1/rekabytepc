"use client";

import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toggleCart } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const [query, setQuery] = useState("");

  useEffect(() => {
    const calc = () => setIsMobile(window.innerWidth < 1024);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
  }, [searchParams]);

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

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const q = query.trim();

    if (!q) {
      router.push("/productos");
      return;
    }

    router.push(`/productos?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="rb-header">
      <div className="rb-topbar">
        <div className="rb-container rb-topbar-row">
          <div className="flex items-center">
            <span className="pill">
              <FaEnvelope /> contacto@rekabyte.cl
            </span>
            <span className="pill">
              <FaMapMarkerAlt /> Punto de retiro, A pasos de metro Lo vial, San
              Miguel
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
            <button onClick={toggleCart} className="rb-action">
              <FaShoppingCart /> <span>Carrito</span> <CartCount />
            </button>
          </div>
        </div>
      </div>

      <nav className="rb-nav">
        <div className="rb-container rb-nav-row">
          <div
            className="rb-mega-wrap"
            onMouseEnter={openMenuSoft}
            onMouseLeave={closeMenuSoft}
          >
            <button className="rb-pill" onClick={toggleMenuMobile} type="button">
              Computadores Armados
            </button>

            {menuOpen ? (
              <GamesMegaMenu onNavigate={() => setMenuOpen(false)} />
            ) : null}
          </div>

          <ComponentsMenu />
          <GamingStreamingMenu />
        </div>
      </nav>

      <CartDrawer />
    </header>
  );
}