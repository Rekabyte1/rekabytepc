"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CLP } from "@/components/CartContext";

export type Customer = {
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  telefono: string;
};

export type Envio =
  | {
      tipo: "pickup";
      costoEnvio: number; // 0
      direccion?: string;
      region?: string;
      comuna?: string;
      courier?: null;
    }
  | {
      tipo: "delivery";
      costoEnvio: number;
      direccion: string;
      region: string;
      comuna: string;
      courier: "chilexpress" | "bluexpress";
    };

export type Pago = {
  metodo: "transferencia" | "mercadopago" | "webpay";
  documento: "boleta" | "factura";
  factura?: {
    razonSocial: string;
    rut: string;
    giro: string;
    telefono: string;
    region: string;
    comuna: string;
    calle: string;
    numero: string;
    extra?: string;
  } | null;
};

type CheckoutCtx = {
  // Fuente de verdad
  customer: Customer | null;
  envio: Envio | null;
  pago: Pago | null;

  // ✅ indica si ya cargamos sessionStorage
  hydrated: boolean;

  setCustomer: (c: Customer) => void;
  setEnvio: (e: Envio) => void;
  setPago: (p: Pago) => void;

  reset: () => void;

  // Compatibilidad legacy
  datos?: Customer | null;
  contacto?: Customer | null;
  setDatos?: (c: Customer) => void;
  setContacto?: (c: Customer) => void;
};

const CheckoutCtx = createContext<CheckoutCtx | null>(null);

const SS_CUSTOMER = "checkout_customer_v1";
const SS_ENVIO = "checkout_envio_v1";
const SS_PAGO = "checkout_pago_v1";

function readSS<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeSS(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function removeSS(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomerState] = useState<Customer | null>(null);
  const [envio, setEnvioState] = useState<Envio | null>(null);
  const [pago, setPagoState] = useState<Pago | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Cargar desde sessionStorage al montar (para que el guard sea estable)
  useEffect(() => {
    const c = readSS<Customer>(SS_CUSTOMER);
    const e = readSS<Envio>(SS_ENVIO);
    const p = readSS<Pago>(SS_PAGO);

    if (c) setCustomerState(c);
    if (e) setEnvioState(e);
    if (p) setPagoState(p);

    setHydrated(true);
  }, []);

  const setCustomer = (c: Customer) => {
    setCustomerState(c);
    writeSS(SS_CUSTOMER, c);
    // compatibilidad con tu key antigua (por si otra pantalla la usa)
    writeSS("checkout_datos", c);
  };

  const setEnvio = (e: Envio) => {
    setEnvioState(e);
    writeSS(SS_ENVIO, e);
  };

  const setPago = (p: Pago) => {
    setPagoState(p);
    writeSS(SS_PAGO, p);
  };

  const reset = () => {
    setCustomerState(null);
    setEnvioState(null);
    setPagoState(null);
    removeSS(SS_CUSTOMER);
    removeSS(SS_ENVIO);
    removeSS(SS_PAGO);
    removeSS("checkout_datos");
  };

  const value = useMemo<CheckoutCtx>(
    () => ({
      customer,
      envio,
      pago,
      hydrated,
      setCustomer,
      setEnvio,
      setPago,
      reset,

      // legacy
      datos: customer,
      contacto: customer,
      setDatos: setCustomer,
      setContacto: setCustomer,
    }),
    [customer, envio, pago, hydrated]
  );

  return <CheckoutCtx.Provider value={value}>{children}</CheckoutCtx.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutCtx);
  if (!ctx) throw new Error("useCheckout must be used inside CheckoutProvider");
  return ctx;
}

// Helpers “mock” para costo de envío por courier (ajústalo si quieres)
export function calcularEnvio(courier: "chilexpress" | "bluexpress") {
  return courier === "bluexpress" ? 14000 : 8200;
}

export const PAYMENT_HELP = {
  transferencia:
    "Transferencia o depósito bancario. Recibirás los datos al confirmar tu compra.",
  mercadopago:
    "Paga con débito o crédito a través de Mercado Pago. Hasta 3–6 cuotas sin interés (según promoción).",
  webpay: "Paga con débito o crédito mediante Webpay.",
} as const;

export const CLP_LOCAL = CLP;