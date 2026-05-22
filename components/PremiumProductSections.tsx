import Image from "next/image";

type PremiumHighlight = {
  label: string;
  text: string;
};

type PremiumGridItem = {
  title: string;
  description?: string;
  image?: string;
};

type PremiumHeroSection = {
  type: "hero";
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  highlights?: PremiumHighlight[];
};

type PremiumSplitSection = {
  type: "split";
  title: string;
  description?: string;
  image?: string;
  reverse?: boolean;
};

type PremiumGridSection = {
  type: "grid";
  title?: string;
  description?: string;
  items: PremiumGridItem[];
};

export type PremiumSection =
  | PremiumHeroSection
  | PremiumSplitSection
  | PremiumGridSection;

type PremiumProductSectionsProps = {
  sections?: PremiumSection[] | null;
};

function GlowBackdrop() {
  return (
    <>
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[22rem] w-[54rem] -translate-x-1/2 rounded-full bg-lime-400/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-10 right-4 h-72 w-72 rounded-full bg-lime-300/8 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(163,230,53,0.11),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(163,230,53,0.07),transparent_44%),linear-gradient(155deg,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0.42)_68%)]" />
    </>
  );
}

export default function PremiumProductSections({
  sections,
}: PremiumProductSectionsProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <section className="relative mt-24 space-y-16 md:mt-32 md:space-y-24">
      {sections.map((section, index) => {
        if (section.type === "hero") {
          return (
            <article
              key={`premium-hero-${index}`}
              className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-gradient-to-b from-neutral-900/95 via-black to-neutral-950 px-7 py-14 shadow-[0_60px_150px_rgba(0,0,0,0.78)] md:px-12 md:py-20 lg:min-h-[760px] lg:px-16 lg:py-20"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_68%_48%,rgba(132,204,22,0.18),transparent_40%),radial-gradient(circle_at_28%_22%,rgba(132,204,22,0.09),transparent_36%),linear-gradient(145deg,rgba(255,255,255,0.01)_0%,rgba(0,0,0,0.5)_72%)]" />
              <GlowBackdrop />

              <div className="relative z-10 grid grid-cols-1 gap-12 lg:grid-cols-[0.84fr_1.16fr] lg:items-center lg:gap-16">
                <div className="space-y-8 md:space-y-10 lg:max-w-[38rem]">
                  {section.eyebrow ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.36em] text-lime-300/90 md:text-sm">
                      {section.eyebrow}
                    </p>
                  ) : null}

                  <h2
                    className="font-black uppercase tracking-[-0.01em] text-white"
                    style={{
                      fontSize: "clamp(1.8rem, 3.2vw, 3.5rem)",
                      lineHeight: "1.1",
                      maxWidth: "15ch",
                    }}
                  >
                    {section.title}
                  </h2>

                  {section.description ? (
                    <p className="max-w-2xl text-base leading-[1.85] text-neutral-300 md:text-lg">
                      {section.description}
                    </p>
                  ) : null}

                  {!!section.highlights?.length && (
                    <div className="grid max-w-[28rem] grid-cols-2 gap-4 pt-3 md:gap-5">
                      {section.highlights.map((highlight, highlightIdx) => (
                        <div
                          key={`${highlight.label}-${highlightIdx}`}
                          className="w-full min-w-0 rounded-2xl border border-lime-400/15 bg-black/25 px-4 py-4 backdrop-blur-md transition-all duration-500 hover:translate-y-[-2px] hover:border-lime-300/25"
                        >
                          <p className="text-2xl font-black leading-none text-lime-300 md:text-3xl">
                            {highlight.label}
                          </p>
                          <p className="mt-2 text-[10px] uppercase tracking-[0.16em] leading-[1.45] text-neutral-300 md:text-[11px]">
                            {highlight.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {section.image ? (
                  <div className="relative min-h-[390px] overflow-visible md:min-h-[510px] lg:min-h-[660px]">
                    <div className="pointer-events-none absolute inset-x-[5%] top-[24%] h-[52%] rounded-full bg-lime-400/14 blur-[95px]" />
                    <div className="pointer-events-none absolute inset-x-[12%] bottom-[7%] h-[30%] rounded-full bg-black/35 blur-[48px]" />
                    <Image
                      src={section.image}
                      alt={section.title}
                      fill
                      className="object-contain object-center p-1 md:p-2 lg:scale-[1.14]"
                      sizes="(max-width: 1024px) 100vw, 56vw"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                ) : null}
              </div>
            </article>
          );
        }

        if (section.type === "split") {
          return (
            <article
              key={`premium-split-${index}`}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 p-5 shadow-[0_35px_95px_rgba(0,0,0,0.65)] md:p-8 lg:p-9"
            >
              <GlowBackdrop />

              <div
                className={`relative z-10 grid grid-cols-1 gap-7 md:gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center lg:gap-12 ${
                  section.reverse ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                {section.image ? (
                  <div className="relative min-h-[350px] overflow-hidden rounded-[1.6rem] border border-lime-400/10 bg-gradient-to-b from-transparent via-neutral-950/25 to-transparent shadow-[0_28px_95px_rgba(132,204,22,0.08)] md:min-h-[470px]">
                    <div className="pointer-events-none absolute inset-x-[10%] top-[20%] h-[52%] rounded-full bg-lime-400/10 blur-[85px]" />
                    <Image
                      src={section.image}
                      alt={section.title}
                      fill
                      className="object-contain p-3 md:p-4"
                      sizes="(max-width: 1024px) 100vw, 58vw"
                    />
                  </div>
                ) : null}

                <div className="space-y-5 px-1 md:px-2">
                  <h3
                    className="font-black uppercase leading-[1.03] tracking-tight text-white"
                    style={{ fontSize: "clamp(1.7rem, 3.7vw, 3.8rem)" }}
                  >
                    {section.title}
                  </h3>
                  {section.description ? (
                    <p className="text-base leading-[1.82] text-neutral-300 md:text-lg">
                      {section.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          );
        }

        return (
          <article
            key={`premium-grid-${index}`}
            className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-neutral-900 via-black to-neutral-950 p-7 md:p-10 lg:p-12"
          >
            {(section.title || section.description) && (
              <div className="mb-8 space-y-3 md:mb-10">
                {section.title ? (
                  <h3
                    className="font-black uppercase tracking-tight text-white"
                    style={{ fontSize: "clamp(1.55rem, 3.4vw, 3.1rem)" }}
                  >
                    {section.title}
                  </h3>
                ) : null}
                {section.description ? (
                  <p className="text-base text-neutral-300 md:text-lg">
                    {section.description}
                  </p>
                ) : null}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {section.items.map((item, itemIdx) => (
                <div
                  key={`${item.title}-${itemIdx}`}
                  className="group flex h-full min-h-[360px] flex-col overflow-hidden rounded-3xl border border-lime-400/12 bg-black/35 shadow-[0_15px_42px_rgba(0,0,0,0.42)] transition-all duration-500 ease-out hover:translate-y-[-2px] hover:border-lime-300/24 hover:shadow-[0_22px_58px_rgba(132,204,22,0.09)]"
                >
                  {item.image ? (
                    <div className="relative h-[220px] flex-none overflow-hidden border-b border-lime-500/10 bg-gradient-to-b from-transparent via-neutral-950/18 to-transparent md:h-[240px]">
                      <div className="pointer-events-none absolute inset-x-[12%] top-[22%] h-[54%] rounded-full bg-lime-400/9 blur-[74px]" />
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent" />
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col space-y-3 p-5 pb-6 md:p-6 md:pb-7">
                    <h4 className="text-lg font-extrabold uppercase tracking-[0.02em] text-white md:text-xl">
                      {item.title}
                    </h4>
                    {item.description ? (
                      <p className="text-sm leading-relaxed text-neutral-300 md:text-base">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </section>
  );
}