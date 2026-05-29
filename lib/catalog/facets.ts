import { COLOR_DICT, CONNECTIVITY_DICT, FAMILY_CONFIGS, FORMAT_DICT, SWITCH_DICT, TYPE_DICT } from "./dictionaries";
import type { CatalogProductView, FacetGroup, FacetKey } from "./types";

function labelFor(key: FacetKey, value: string) {
  if (key === "color") return (COLOR_DICT as Record<string, { label: string }>)[value]?.label ?? value;
  if (key === "switch") return (SWITCH_DICT as Record<string, { label: string }>)[value]?.label ?? value;
  if (key === "connectivity") return (CONNECTIVITY_DICT as Record<string, { label: string }>)[value]?.label ?? value;
  if (key === "format") return (FORMAT_DICT as Record<string, { label: string }>)[value]?.label ?? value;
  if (key === "type") return (TYPE_DICT as Record<string, { label: string }>)[value]?.label ?? value;
  if (key === "stock") return value === "in" ? "En stock" : "Sin stock";
  if (key === "brand") return value;
  if (key === "weightClass") return value === "ultraligero" ? "Ultraligero" : "Estándar";
  return value;
}

function valuesFor(p: CatalogProductView, key: FacetKey): string[] {
  if (key === "stock") return [p.attributes.stockState];
  if (key === "brand") return p.brand ? [p.brand.toLowerCase()] : [];
  if (key === "type") return p.attributes.types;
  if (key === "color") return p.attributes.colors;
  if (key === "format") return p.attributes.formats;
  if (key === "connectivity") return p.attributes.connectivity;
  if (key === "switch") return p.attributes.switches;
  if (key === "weightClass") return p.attributes.weightClass ? [p.attributes.weightClass] : [];
  return [];
}

export function applyFacetFilters(products: CatalogProductView[], filters: Record<string, string[]>) {
  return products.filter((p) =>
    Object.entries(filters).every(([k, selected]) => {
      if (!selected?.length) return true;
      const vals = valuesFor(p, k as FacetKey);
      return selected.some((s) => vals.includes(s));
    })
  );
}

export function buildFacets(
  products: CatalogProductView[],
  family: keyof typeof FAMILY_CONFIGS,
  selected: Record<string, string[]> = {}
): FacetGroup[] {
  const cfg = FAMILY_CONFIGS[family];

  return cfg.allowedFacets.map((key) => {
    const counter = new Map<string, number>();

    for (const p of products) {
      for (const v of valuesFor(p, key)) {
        counter.set(v, (counter.get(v) ?? 0) + 1);
      }
    }

    const options = [...counter.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({
        value,
        label: labelFor(key, value),
        count,
        selected: (selected[key] ?? []).includes(value),
        disabled: count === 0,
        seoEligible: ["magnetico", "mecanico", "wireless", "ultraligero"].includes(value),
        swatchHex: key === "color" ? (COLOR_DICT as Record<string, { swatch?: string }>)[value]?.swatch : undefined,
      }));

    return {
      key,
      label: labelFor(key, key),
      selectionMode: key === "stock" ? "single" : "multi",
      options,
    };
  });
}