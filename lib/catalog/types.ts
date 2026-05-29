export type FamilyKey =
  | "teclados"
  | "mouse"
  | "audio"
  | "alfombrillas"
  | "streaming"
  | "componentes";

export type SeoLandingKey = "magneticos" | "mecanicos" | "wireless" | "ultraligeros";

export type IndexPolicy = "index" | "noindex";

export type SourceField = "subcategory" | "name" | "slug" | "shortDescription" | "description" | "specs";

export type ProductLike = {
  id?: string;
  slug: string;
  name: string;
  category?: string | null;
  subcategory?: string | null;
  brand?: string | null;
  stock?: number | null;
  imageUrl?: string | null;
  priceTransfer?: number | null;
  shortDescription?: string | null;
  description?: string | null;
  specs?: unknown;
  isActive?: boolean;
};

export type ProductAttributes = {
  family: FamilyKey;
  brand: string | null;
  stockState: "in" | "out";
  isMagnetic: boolean;
  isMechanical: boolean;
  isWireless: boolean;
  isUltralight: boolean;
  colors: string[];
  switches: string[];
  connectivity: string[];
  formats: string[];
  types: string[];
  weightClass: "ultraligero" | "estandar" | null;
  evidence: {
    confidence: number;
    matched: Array<{ field: SourceField; token: string; normalizedValue: string }>;
  };
};

export type CatalogProductView = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  family: FamilyKey;
  stock: number | null;
  isInStock: boolean;
  imageUrl: string | null;
  priceTransfer: number | null;
  attributes: ProductAttributes;
  source: ProductLike;
};

export type FacetKey =
  | "stock"
  | "brand"
  | "type"
  | "color"
  | "format"
  | "connectivity"
  | "switch"
  | "weightClass";

export type FacetOption = {
  value: string;
  label: string;
  count: number;
  selected: boolean;
  disabled: boolean;
  seoEligible: boolean;
  swatchHex?: string;
};

export type FacetGroup = {
  key: FacetKey;
  label: string;
  selectionMode: "single" | "multi";
  options: FacetOption[];
};

export type SeoLandingConfig = {
  key: SeoLandingKey;
  family: FamilyKey;
  path: string;
  priority: number;
  seo: {
    h1: string;
    title: string;
    description: string;
    intro?: string;
    bannerKey?: string;
  };
  matches: (attrs: ProductAttributes) => boolean;
};

export type CanonicalDecision = {
  canonicalUrl: string;
  indexPolicy: IndexPolicy;
  reason: "family-base" | "landing-base" | "landing-with-extra-filters" | "non-seo-query" | "invalid-landing-fallback";
};

export type BreadcrumbState = {
  items: Array<{ label: string; href: string }>;
};

export type FamilyConfig = {
  key: FamilyKey;
  label: string;
  path: string;
  allowedFacets: FacetKey[];
  seoLandings: SeoLandingKey[];
  productMatcher: {
    categories: string[];
    subcategories?: string[];
  };
};