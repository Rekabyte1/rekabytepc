// components/Footer.tsx
"use client";

import Link from "next/link";
import {
  FiShield,
  FiHeadphones,
  FiTruck,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
} from "react-icons/fi";
import { FaInstagram, FaTiktok, FaYoutube, FaTwitch, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-neutral-800 bg-neutral-950 text-neutral-300">
      {/* ============================ */}
      {/* BARRA DE CONFIANZA EN FILA   */}
      {/* ============================ */}
      <div className="border-b border-neutral-800">
        <div className="mx-auto max-w-7xl px-4">
          {/* SIEMPRE 3 columnas, incluso en móvil */}
          <ul className="grid grid-cols-3 gap-6 py-4 text-xs">
            <li className="flex items-center gap-3 justify-start border-r border-neutral-800 pr-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/90">
                <FiShield className="h-5 w-5 text-lime-400" />
              </span>
              <div className="text-left">
                <p className="font-semibold leading-tight text-white">Compra segura</p>
                <p className="text-[11px] text-neutral-400">Webpay / Mercado Pago protegidos.</p>
              </div>
            </li>

            <li className="flex items-center gap-3 justify-start border-r border-neutral-800 px-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/90">
                <FiHeadphones className="h-5 w-5 text-lime-400" />
              </span>
              <div className="text-left">
                <p className="font-semibold leading-tight text-white">Atención al cliente</p>
                <p className="text-[11px] text-neutral-400">Soporte directo por WhatsApp.</p>
              </div>
            </li>

            <li className="flex items-center gap-3 justify-start pl-6 last:border-r-0">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/90">
                <FiTruck className="h-5 w-5 text-lime-400" />
              </span>
              <div className="text-left">
                <p className="font-semibold leading-tight text-white">Envíos a todo Chile</p>
                <p className="text-[11px] text-neutral-400">Retiro o despacho.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* ===================== */}
      {/* CONTENIDO PRINCIPAL   */}
      {/* ===================== */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap gap-8">
          {/* Col 1 */}
          <div className="min-w-[240px] flex-1 md:basis-1/4">
            <p className="text-lg font-extrabold text-white">RekaByte</p>
            <p className="mt-2 text-sm text-neutral-400">
              Computadoras armadas y estaciones de trabajo. Rendimiento real y
              soporte post-venta.
            </p>

            <div className="mt-3 flex items-center gap-3 text-neutral-400">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="transition-colors hover:text-lime-400"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="transition-colors hover:text-lime-400"
              >
                <FaTiktok className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="transition-colors hover:text-lime-400"
              >
                <FaYoutube className="h-5 w-5" />
              </a>
              <a
                href="https://twitch.tv/"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitch"
                className="transition-colors hover:text-lime-400"
              >
                <FaTwitch className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/56912345678"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="transition-colors hover:text-lime-400"
              >
                <FaWhatsapp className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Col 2 */}
          <div className="min-w-[240px] flex-1 md:basis-1/4">
            <p className="font-semibold text-white">Contacto</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <FiMapPin className="h-4 w-4 text-neutral-400" />
                A pasos de metro Lo vial, San Miguel
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="h-4 w-4 text-neutral-400" />
                +56 9 1234 5678
              </li>
              <li className="flex items-center gap-2">
                <FiMail className="h-4 w-4 text-neutral-400" />
                <a
                  href="mailto:contacto@rekabyte.cl"
                  className="hover:text-lime-400"
                >
                  contacto@rekabyte.cl
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FaWhatsapp className="h-4 w-4 text-neutral-400" />
                <a
                  href="https://wa.me/56912345678"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-lime-400"
                >
                  Escríbenos por WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="min-w-[240px] flex-1 md:basis-1/4">
            <p className="font-semibold text-white">Horario</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <FiClock className="h-4 w-4 text-neutral-400" />
                Lunes a Viernes, 10:00–18:30 hrs.
              </li>
              <li className="text-neutral-400">Punto de retiro disponible.</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="min-w-[240px] flex-1 md:basis-1/4">
            <p className="font-semibold text-white">Información</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link href="/terminos" className="hover:text-lime-400">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                {/* 🔧 ruta corregida */}
                <Link href="/garantias" className="hover:text-lime-400">
                  Garantías y devoluciones
                </Link>
              </li>
              <li>
                <Link href="/envios" className="hover:text-lime-400">
                  Envíos y retiros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-lime-400">
                  Contáctanos
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-neutral-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-neutral-400 md:flex-row">
          <p>© 2026 RekaByte. Todos los derechos reservados.</p>
          <p>Webpay · Mercado Pago · Transbank</p>
        </div>
      </div>
    </footer>
  );
}
