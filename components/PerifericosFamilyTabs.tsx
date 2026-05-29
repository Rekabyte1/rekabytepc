import Link from "next/link";

export type PerifericosFamilyKey = "all" | "teclados" | "mouse" | "audio" | "alfombrillas";

type Tab = {
  key: PerifericosFamilyKey;
  label: string;
  href: string;
};

const TABS: Tab[] = [
  { key: "all", label: "Todos", href: "/perifericos" },
  { key: "teclados", label: "Teclados", href: "/perifericos/teclados" },
  { key: "mouse", label: "Mouse", href: "/perifericos/mouse" },
  { key: "audio", label: "Audio", href: "/perifericos/audio" },
  { key: "alfombrillas", label: "Alfombrillas", href: "/perifericos/alfombrillas" },
];

export function PerifericosFamilyTabs({
  active,
  counts,
}: {
  active: PerifericosFamilyKey;
  counts?: Partial<Record<PerifericosFamilyKey, number>>;
}) {
  return (
    <nav
      aria-label="Familias de periféricos"
      className="-mx-3 mt-5 overflow-x-auto px-3 pb-1 sm:mx-0 sm:mt-6 sm:px-0"
    >
      <div className="flex min-w-max items-center gap-2">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          const count = counts?.[tab.key];
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
                isActive
                  ? "border-lime-300 bg-lime-400/20 text-lime-200 shadow-[0_0_0_1px_rgba(163,230,53,0.15)]"
                  : "border-neutral-700 bg-neutral-900/75 text-neutral-200 hover:border-lime-400/45 hover:bg-neutral-900"
              }`}
            >
              <span>{tab.label}</span>
              {typeof count === "number" ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] ${
                    isActive ? "bg-lime-200/20 text-lime-100" : "bg-neutral-800 text-neutral-300"
                  }`}
                >
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}