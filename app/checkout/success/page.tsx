// app/checkout/success/page.tsx
import React, { Suspense } from "react";
import SuccessClient from "./success-client";

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="rb-container" style={{ padding: 24, color: "#e5e7eb" }}>
          Cargando...
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
