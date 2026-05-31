"use client";

import Link from "next/link";
import { useState } from "react";

const brands = [
  {
    name: "Lamzu",
    logo: "/brands/lamzu.svg",
    href: "/perifericos?brand=lamzu",
  },
  {
    name: "Fantech",
    logo: "/brands/fantech.svg",
    href: "/perifericos?brand=fantech",
  },
  {
    name: "Attack Shark",
    logo: "/brands/attack-shark.svg",
    href: "/perifericos?brand=attack+shark",
  },
];

type Brand = (typeof brands)[number];

function BrandLogo({ brand }: { brand: Brand }) {
  const [logoFailed, setLogoFailed] = useState(false);

  if (logoFailed || !brand.logo) {
    return (
      <span className="text-center text-lg font-black uppercase tracking-[0.22em] text-neutral-100 transition-colors duration-300 group-hover:text-lime-200 sm:text-xl">
        {brand.name}
      </span>
    );
  }

  return (
    <img
      src={brand.logo}
      alt={brand.name}
      draggable={false}
      onError={() => setLogoFailed(true)}
      className="max-h-9 max-w-[150px] object-contain opacity-85 grayscale invert transition duration-300 group-hover:opacity-100 sm:max-h-10 sm:max-w-[180px]"
    />
  );
}

function BrandCard({
  brand,
  duplicate = false,
}: {
  brand: Brand;
  duplicate?: boolean;
}) {
  return (
    <Link
      href={brand.href}
      aria-hidden={duplicate ? true : undefined}
      tabIndex={duplicate ? -1 : undefined}
      className="group flex min-h-[82px] min-w-[190px] items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-950/80 px-7 py-5 shadow-[0_12px_34px_rgba(0,0,0,0.32)] transition duration-300 hover:-translate-y-0.5 hover:border-lime-400/70 hover:bg-neutral-900/90 sm:min-w-[230px] sm:px-9 md:min-w-[260px]"
    >
      <BrandLogo brand={brand} />
    </Link>
  );
}

export default function FeaturedBrandsCarousel() {
  /*
    Se duplican varias vueltas para que el marquee se vea continuo
    incluso con pocas marcas. Para agregar una marca nueva, solo suma
    un objeto al array `brands`.
  */
  const loops = Array.from({ length: 4 }, (_, loopIndex) => loopIndex);

  return (
    <section className="overflow-hidden rounded-3xl border border-neutral-800 bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.08),transparent_38%),linear-gradient(180deg,rgba(10,10,10,0.98),rgba(0,0,0,0.95))] px-4 py-7 shadow-[0_18px_60px_rgba(0,0,0,0.35)] sm:px-6 md:py-8">
      <div className="mx-auto mb-5 max-w-3xl text-center">
        <p className="text-xs font-display font-extrabold uppercase tracking-[0.24em] text-lime-300/80">
          Marcas destacadas
        </p>

        <p className="mt-2 text-sm text-neutral-400 sm:text-base">
          Periféricos gamer seleccionados por rendimiento, calidad y experiencia
          competitiva.
        </p>
      </div>

      <div className="rb-brand-marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="rb-brand-marquee-track flex w-max gap-3 py-1 sm:gap-4">
          {loops.map((loopIndex) =>
            brands.map((brand) => (
              <BrandCard
                key={`${brand.name}-${loopIndex}`}
                brand={brand}
                duplicate={loopIndex > 0}
              />
            ))
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes rb-brand-marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .rb-brand-marquee-track {
          animation: rb-brand-marquee 24s linear infinite;
        }

        .rb-brand-marquee:hover .rb-brand-marquee-track {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .rb-brand-marquee-track {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}