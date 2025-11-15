"use client";

import { createContext, useContext, useMemo, useState } from "react";
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
  customer: Customer | null;
  envio: Envio | null;
  pago: Pago | null;

  setCustomer: (c: Customer) => void;
  setEnvio: (e: Envio) => void;
  setPago: (p: Pago) => void;

  reset: () => void;
};

const CheckoutCtx = createContext<CheckoutCtx | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [pago, setPago] = useState<Pago | null>(null);

  const value = useMemo(
    () => ({
      customer,
      envio,
      pago,
      setCustomer,
      setEnvio,
      setPago,
      reset: () => {
        setCustomer(null);
        setEnvio(null);
        setPago(null);
      },
    }),
    [customer, envio, pago]
  );

  return <CheckoutCtx.Provider value={value}>{children}</CheckoutCtx.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutCtx);
  if (!ctx) throw new Error("useCheckout must be used inside CheckoutProvider");
  return ctx;
}

// Helpers “mock” para costo de envío por courier (puedes cambiarlos luego)
export function calcularEnvio(courier: "chilexpress" | "bluexpress") {
  return courier === "bluexpress" ? 14000 : 82000; // sólo ejemplo visible
}

// Texto de ayuda por método de pago
export const PAYMENT_HELP = {
  transferencia:
    "Transferencia o depósito bancario. Recibirás los datos al confirmar tu compra.",
  mercadopago:
    "Paga con débito o crédito a través de Mercado Pago. Hasta 3–6 cuotas sin interés (según promoción).",
  webpay: "Paga con débito o crédito mediante Webpay.",
} as const;

// Utilidad local (si no quieres importar CLP)
export const CLP_LOCAL = CLP;
