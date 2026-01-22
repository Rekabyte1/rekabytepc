"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AdminAutoRefreshProps = {
  intervalMs?: number; // por defecto 10 segundos
};

export default function AdminAutoRefresh({
  intervalMs = 10_000,
}: AdminAutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null; // no pinta nada, solo hace el efecto
}