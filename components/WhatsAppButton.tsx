"use client";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP = "56912345678"; // cámbialo

export default function WhatsAppButton() {
  return (
    <Link
      href={`https://wa.me/${WHATSAPP}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-xl transition hover:bg-green-400"
    >
      <FaWhatsapp className="h-7 w-7" />
    </Link>
  );
}
