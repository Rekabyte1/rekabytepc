"use client";
import React from "react";

export default function CheckoutShell({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="checkout-page">
      <div className="grid-two">
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
          {left}
        </section>

        <aside className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
          {right}
        </aside>
      </div>
    </div>
  );
}
