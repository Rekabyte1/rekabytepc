"use client";

import { CheckoutProvider } from "@/components/CheckoutStore";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Este provider habilita useCheckout() sólo dentro de /checkout/*
  return <CheckoutProvider>{children}</CheckoutProvider>;
}
