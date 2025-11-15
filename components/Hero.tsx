// app/components/Hero.tsx
'use client';

import { useEffect, useState } from 'react';

const slides = ['/banners/banner-1.jpg', '/banners/banner-2.jpg', '/banners/banner-3.jpg'];

export default function Hero() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="rb-container my-8">
      <div className="relative w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-lg">
        <div
          className="relative w-full"
          style={{
            height: 'clamp(360px, calc(100vw / 1.92), 760px)',
          }}
        >
          <img
            src={slides[index]}
            alt={`Banner ${index + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',  // <— NO recorta
              backgroundColor: '#000',
              display: 'block',
            }}
            draggable={false}
          />
        </div>

        <button
          onClick={prev}
          aria-label="Anterior"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-neutral-200 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-lime-400/60"
        >
          ‹
        </button>
        <button
          onClick={next}
          aria-label="Siguiente"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-neutral-200 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-lime-400/60"
        >
          ›
        </button>

        <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={
                'h-1.5 w-4 rounded-full transition-colors ' +
                (i === index ? 'bg-lime-400' : 'bg-neutral-600/60')
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
