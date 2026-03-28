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
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaTwitch,
  FaWhatsapp,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-neutral-800 bg-neutral-950 text-neutral-300">
      {/* ============================ */}
      {/* BARRA DE CONFIANZA EN FILA   */}
      {/* ============================ */}
      <div className="border-b border-neutral-800">
        <div className="mx-auto max-w-7xl px-4">
          <ul className="grid grid-cols-3 gap-6 py-4 text-xs">
            <li className="flex items-center gap-3 justify-start border-r border-neutral-800 pr-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/90">
                <FiShield className="h-5 w-5 text-lime-400" />
              </span>
              <div className="text-left">
                <p className="font-semibold leading-tight text-white">
                  Compra segura
                </p>
                <p className="text-[11px] text-neutral-400">
                  Webpay / Mercado Pago protegidos.
                </p>
              </div>
            </li>

            <li className="flex items-center gap-3 justify-start border-r border-neutral-800 px-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/90">
                <FiHeadphones className="h-5 w-5 text-lime-400" />
              </span>
              <div className="text-left">
                <p className="font-semibold leading-tight text-white">
                  Atención al cliente
                </p>
                <p className="text-[11px] text-neutral-400">
                  Soporte directo por WhatsApp.
                </p>
              </div>
            </li>

            <li className="flex items-center gap-3 justify-start pl-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/90">
                <FiTruck className="h-5 w-5 text-lime-400" />
              </span>
              <div className="text-left">
                <p className="font-semibold leading-tight text-white">
                  Envíos a todo Chile
                </p>
                <p className="text-[11px] text-neutral-400">
                  Retiro o despacho.
                </p>
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
          {/* Col 1 - Marca */}
          <div className="min-w-[220px] flex-1 md:basis-1/5">
            <p className="text-lg font-extrabold text-white">RekaByte</p>
            <p className="mt-2 text-sm text-neutral-400">
              Computadoras armadas, hardware y más. Construido por gamers,
              enfocado en rendimiento real y estabilidad.
            </p>

            <div className="mt-3 flex items-center gap-3 text-neutral-400">
              <FaInstagram className="h-5 w-5 hover:text-lime-400" />
              <FaTiktok className="h-5 w-5 hover:text-lime-400" />
              <FaYoutube className="h-5 w-5 hover:text-lime-400" />
              <FaTwitch className="h-5 w-5 hover:text-lime-400" />
              <FaWhatsapp className="h-5 w-5 hover:text-lime-400" />
            </div>
          </div>

          {/* Col 2 - Quiénes somos */}
          <div className="min-w-[220px] flex-1 md:basis-1/5">
            <p className="font-semibold text-white">Quiénes somos</p>
            <p className="mt-2 text-sm text-neutral-400">
              RekaByte nace desde la experiencia real en gaming, software y 
              hardware. Cada equipo es ensamblado y probado con
              criterios técnicos sólidos, buscando equilibrio entre
              rendimiento, estética y confiabilidad.
            </p>
          </div>

          {/* Col 3 - Contacto */}
          <div className="min-w-[220px] flex-1 md:basis-1/5">
            <p className="font-semibold text-white">Contacto</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <FiMapPin className="h-4 w-4 text-neutral-400" />
                San Miguel, Santiago
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="h-4 w-4 text-neutral-400" />
                +56 9 1234 5678
              </li>
              <li className="flex items-center gap-2">
                <FiMail className="h-4 w-4 text-neutral-400" />
                contacto@rekabyte.cl
              </li>
            </ul>
          </div>

          {/* Col 4 - Horario */}
          <div className="min-w-[220px] flex-1 md:basis-1/5">
            <p className="font-semibold text-white">Horario</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <FiClock className="h-4 w-4 text-neutral-400" />
                Atención personalizada durante el día.
                Coordinamos entregas y retiros según disponibilidad.
                Retiros previa coordinación.
                Sábado: 08:00–13:00 hrs.
                San Miguel.
              </li>
              <li className="text-neutral-400">
                Punto de retiro disponible.
              </li>
            </ul>
          </div>

          {/* Col 5 - Información */}
          <div className="min-w-[220px] flex-1 md:basis-1/5">
            <p className="font-semibold text-white">Información</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link href="/terminos" className="hover:text-lime-400">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/garantias" className="hover:text-lime-400">
                  Garantías y devoluciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-lime-400">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/envios" className="hover:text-lime-400">
                  Envíos y retiros
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