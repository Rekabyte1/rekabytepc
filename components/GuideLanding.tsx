import Link from "next/link";

type GuideSection = {
  title: string;
  text: string;
};

type GuideCompare = {
  label: string;
  value: string;
};

type Props = {
  kicker: string;
  title: string;
  subtitle: string;
  heroImage: string;
  sections: GuideSection[];
  highlights: string[];
  compareTitle: string;
  compare: GuideCompare[];
};

export default function GuideLanding({
  kicker,
  title,
  subtitle,
  heroImage,
  sections,
  highlights,
  compareTitle,
  compare,
}: Props) {
  return (
    <main className="rb-container py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-neutral-800">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-lime-500/10" />
          <div className="relative p-8 md:p-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">{kicker}</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-black text-white md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-300 md:text-base">{subtitle}</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {sections.map((s) => (
            <article key={s.title} className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6">
              <h2 className="text-lg font-extrabold text-white">{s.title}</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-300">{s.text}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6">
          <h2 className="text-xl font-extrabold text-white">{compareTitle}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {compare.map((row) => (
              <div key={row.label} className="rounded-xl border border-neutral-800 bg-black/30 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-lime-300">{row.label}</p>
                <p className="mt-2 text-sm text-neutral-300">{row.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6">
          <h2 className="text-xl font-extrabold text-white">Puntos clave</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {highlights.map((h) => (
              <li key={h} className="rounded-xl border border-neutral-800 bg-black/30 px-4 py-3 text-sm text-neutral-200">
                {h}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-lime-400/30 bg-lime-400/10 p-6">
          <h2 className="text-xl font-extrabold text-white">Cómo llevarlo a tu setup</h2>
          <p className="mt-2 text-sm leading-7 text-neutral-200">
            Si ya tienes claro qué priorizar, en RekaByte puedes filtrar periféricos por tipo y armar un setup
            coherente con tu estilo de juego, sin saltar directo a comprar por impulso.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/gaming-streaming/perifericos" className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-extrabold text-black">
              Ver periféricos
            </Link>
            <Link href="/setup-gamer" className="rounded-xl border border-lime-400/40 bg-black/20 px-4 py-2 text-sm font-extrabold text-lime-300">
              Explorar Setup Gamer
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}