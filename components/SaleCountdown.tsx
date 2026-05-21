"use client";

import { useEffect, useMemo, useState } from "react";

function formatRemaining(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default function SaleCountdown({ endsAt }: { endsAt?: string | null }) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setMounted(true);
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const text = useMemo(() => {
    if (!endsAt) return null;
    const end = new Date(endsAt).getTime();
    if (Number.isNaN(end) || now >= end) return "Oferta finalizada";
    return formatRemaining(end - now);
  }, [endsAt, now]);

  if (!mounted || !text) return null;

  return <p className="mt-2 text-sm font-semibold text-amber-300">Termina en: {text}</p>;
}