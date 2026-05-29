import { FAMILY_CONFIGS, SEO_LANDINGS } from "./dictionaries";
import type {
  BreadcrumbState,
  CanonicalDecision,
  CatalogProductView,
  FamilyKey,
  SeoLandingConfig,
  SeoLandingKey,
} from "./types";

export function resolveLandingByPriority(
  family: FamilyKey,
  products: CatalogProductView[]
): SeoLandingConfig | null {
  const candidates = SEO_LANDINGS.filter((l) => l.family === family).sort(
    (a, b) => b.priority - a.priority
  );

  for (const landing of candidates) {
    if (products.some((p) => landing.matches(p.attributes))) return landing;
  }

  return null;
}

export function decideCanonical(input: {
  baseUrl: string;
  family: FamilyKey;
  landing: SeoLandingKey | null;
  hasQueryFilters: boolean;
  isValidLanding: boolean;
}): CanonicalDecision {
  const familyPath = FAMILY_CONFIGS[input.family].path;

  if (!input.landing) {
    return {
      canonicalUrl: `${input.baseUrl}${familyPath}`,
      indexPolicy: input.hasQueryFilters ? "noindex" : "index",
      reason: input.hasQueryFilters ? "non-seo-query" : "family-base",
    };
  }

  const landing = SEO_LANDINGS.find(
    (l) => l.family === input.family && l.key === input.landing
  );

  if (!landing || !input.isValidLanding) {
    return {
      canonicalUrl: `${input.baseUrl}${familyPath}`,
      indexPolicy: "noindex",
      reason: "invalid-landing-fallback",
    };
  }

  if (input.hasQueryFilters) {
    return {
      canonicalUrl: `${input.baseUrl}${landing.path}`,
      indexPolicy: "noindex",
      reason: "landing-with-extra-filters",
    };
  }

  return {
    canonicalUrl: `${input.baseUrl}${landing.path}`,
    indexPolicy: "index",
    reason: "landing-base",
  };
}

export function buildCatalogBreadcrumb(input: {
  family: FamilyKey;
  landingLabel?: string | null;
}): BreadcrumbState {
  const familyLabelMap: Record<FamilyKey, string> = {
    teclados: "Teclados",
    mouse: "Mouse",
    audio: "Audio",
    alfombrillas: "Alfombrillas",
    streaming: "Streaming",
    componentes: "Componentes",
  };

  if (input.family === "streaming") {
    return {
      items: [
        { label: "Home", href: "/" },
        { label: "Streaming", href: "/streaming" },
      ],
    };
  }

  if (input.family === "componentes") {
    return {
      items: [
        { label: "Home", href: "/" },
        { label: "Componentes", href: "/componentes" },
      ],
    };
  }

  const base = [
    { label: "Home", href: "/" },
    { label: "Periféricos", href: "/perifericos" },
  ];

  const familyPath = FAMILY_CONFIGS[input.family].path;

  if (input.landingLabel) {
    return {
      items: [...base, { label: input.landingLabel, href: familyPath }],
    };
  }

  return {
    items: [...base, { label: familyLabelMap[input.family], href: familyPath }],
  };
}

export function parseAndNormalizeFilters(searchParams: URLSearchParams) {
  const allowed = [
    "stock",
    "brand",
    "type",
    "color",
    "format",
    "connectivity",
    "switch",
    "weightClass",
  ];

  const out: Record<string, string[]> = {};

  for (const key of allowed) {
    const raw = searchParams.get(key);
    if (!raw) continue;

    const vals = raw
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);

    if (vals.length) out[key] = [...new Set(vals)].sort();
  }

  return out;
}

export function serializeFilters(filters: Record<string, string[]>) {
  const params = new URLSearchParams();

  Object.keys(filters)
    .sort()
    .forEach((key) => {
      const vals = [...new Set((filters[key] ?? []).map((v) => v.toLowerCase()))].sort();
      if (vals.length) params.set(key, vals.join(","));
    });

  return params.toString();
}