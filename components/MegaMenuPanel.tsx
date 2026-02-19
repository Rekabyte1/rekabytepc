"use client";

import Link from "next/link";

export type MegaGroup = {
  title: string;
  items: { label: string; href: string }[];
};

export default function MegaMenuPanel({
  groups,
  footerLabel,
  footerHref,
  onNavigate,
}: {
  groups: MegaGroup[];
  footerLabel?: string;
  footerHref?: string;
  onNavigate?: () => void;
}) {
  return (
    <div
      className={[
        "absolute left-0 top-full z-50 mt-2 w-[min(1100px,calc(100vw-2rem))]",
        "rounded-2xl border border-neutral-800 bg-neutral-950/95 shadow-2xl",
        "backdrop-blur-md",
      ].join(" ")}
    >
      <div className="grid gap-8 p-6 md:grid-cols-3 lg:grid-cols-5">
        {groups.map((g) => (
          <div key={g.title}>
            <div className="text-sm font-extrabold text-lime-300">{g.title}</div>
            <div className="mt-3 space-y-2">
              {g.items.map((it) => (
                <Link
                  key={it.href + it.label}
                  href={it.href}
                  onClick={onNavigate}
                  className="block text-sm font-semibold text-neutral-100 hover:text-lime-300"
                >
                  {it.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* línea verde inferior como tu mega menú */}
      <div className="h-[3px] w-full bg-lime-400" />

      {footerLabel && footerHref ? (
        <div className="px-6 py-4">
          <Link
            href={footerHref}
            onClick={onNavigate}
            className="inline-flex rounded-lg border border-lime-400/30 bg-lime-400/10 px-3 py-2 text-sm font-extrabold text-lime-300 hover:bg-lime-400/15"
          >
            {footerLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
