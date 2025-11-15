"use client";

import Link from "next/link";

const steps = [
  { href: "/checkout", title: "Tus datos" },
  { href: "/checkout/envio", title: "Forma de entrega" },
  { href: "/checkout/pago", title: "Medio de pago" },
  { href: "/checkout/confirmacion", title: "Confirmación" },
];

export default function CheckoutSteps({ active = 0 }: { active?: number }) {
  return (
    <nav className="mb-6 flex items-center justify-center gap-3 text-sm">
      {steps.map((s, i) => (
        <div key={s.href} className="flex items-center gap-3">
          <Link
            href={s.href}
            className={`rounded-full px-3 py-1 font-semibold ${
              i === active
                ? "bg-lime-400 text-black"
                : "bg-neutral-900 text-neutral-300"
            }`}
          >
            {i + 1}. {s.title}
          </Link>
          {i < steps.length - 1 && (
            <span className="text-neutral-600">›</span>
          )}
        </div>
      ))}
    </nav>
  );
}
