import { COLOR_DICT, CONNECTIVITY_DICT, FORMAT_DICT, SWITCH_DICT, TYPE_DICT } from "./dictionaries";
import type { FamilyKey, ProductAttributes, ProductLike, SourceField } from "./types";

export function normalizeText(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildBag(p: ProductLike) {
  return {
    subcategory: normalizeText(p.subcategory),
    name: normalizeText(p.name),
    slug: normalizeText(p.slug),
    shortDescription: normalizeText(p.shortDescription),
    description: normalizeText(p.description),
    specs: normalizeText(JSON.stringify(p.specs ?? {})),
  };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collectMatches(dict: Record<string, { aliases: readonly string[] }>, bag: ReturnType<typeof buildBag>) {
  const out: string[] = [];
  const evidence: Array<{ field: SourceField; token: string; normalizedValue: string }> = [];
  (Object.keys(dict) as string[]).forEach((key) => {
    const aliases = dict[key].aliases.map(normalizeText);
    for (const token of aliases) {
      (Object.keys(bag) as SourceField[]).forEach((field) => {
        if (bag[field].includes(token)) {
          if (!out.includes(key)) out.push(key);
          evidence.push({ field, token, normalizedValue: key });
        }
      });
    }
  });
  return { values: out, evidence };
}

function getSpecsColorValue(product: ProductLike): string {
  const specs = product.specs;
  if (!specs || typeof specs !== "object") return "";

  const typed = specs as Record<string, unknown>;
  const raw = typed.color ?? typed.colour;

  if (raw == null) return "";
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw.map((v) => String(v ?? "")).join(" ");
  return String(raw);
}

function collectStrictColorMatches(product: ProductLike) {
  const strictBag = {
    specsColor: normalizeText(getSpecsColorValue(product)),
    name: normalizeText(product.name),
    slug: normalizeText(product.slug),
  };

  const values: string[] = [];
  const evidence: Array<{ field: SourceField; token: string; normalizedValue: string }> = [];

  (Object.keys(COLOR_DICT) as string[]).forEach((key) => {
    const aliases = COLOR_DICT[key as keyof typeof COLOR_DICT].aliases.map(normalizeText);

    for (const alias of aliases) {
      const token = escapeRegex(alias);
      const pattern = new RegExp(`(^|[^a-z0-9])${token}([^a-z0-9]|$)`, "i");

      (Object.keys(strictBag) as Array<keyof typeof strictBag>).forEach((field) => {
        const fieldValue = strictBag[field];
        if (!fieldValue) return;
        if (pattern.test(fieldValue)) {
          if (!values.includes(key)) values.push(key);
          evidence.push({
            field: field === "specsColor" ? "specs" : (field as SourceField),
            token: alias,
            normalizedValue: key,
          });
        }
      });
    }
  });

  return { values, evidence };
}

export function inferFamily(product: ProductLike): FamilyKey {
  const category = String(product.category ?? "").toUpperCase();
  const sub = String(product.subcategory ?? "").toUpperCase();
  if (category === "STREAMING") return "streaming";
  if (category === "PERIPHERAL") {
    if (sub === "KEYBOARD") return "teclados";
    if (sub === "MOUSE") return "mouse";
    if (sub === "HEADSET" || sub === "SPEAKER" || sub === "AUDIO") return "audio";
    if (sub === "MOUSEPAD") return "alfombrillas";
    return "componentes";
  }
  return "componentes";
}

export function extractProductAttributes(product: ProductLike): ProductAttributes {
  const bag = buildBag(product);

  // COLOR: extracción estricta (NO description/shortDescription/specs serializado completo)
  const color = collectStrictColorMatches(product);

  // Resto de atributos: extracción amplia
  const switches = collectMatches(SWITCH_DICT, bag);
  const conn = collectMatches(CONNECTIVITY_DICT, bag);
  const formats = collectMatches(FORMAT_DICT, bag);
  const types = collectMatches(TYPE_DICT, bag);

  const isMagnetic = types.values.includes("magnetico") || switches.values.includes("hall-effect");
  const isMechanical = types.values.includes("mecanico");
  const isWireless = conn.values.includes("wireless") || conn.values.includes("trimode");
  const isUltralight = types.values.includes("ultraligero");

  const matched = [...color.evidence, ...switches.evidence, ...conn.evidence, ...formats.evidence, ...types.evidence];
  const confidence = Math.min(1, matched.length / 8);

  return {
    family: inferFamily(product),
    brand: product.brand ?? null,
    stockState: (product.stock ?? 0) > 0 ? "in" : "out",
    isMagnetic,
    isMechanical,
    isWireless,
    isUltralight,
    colors: color.values,
    switches: switches.values,
    connectivity: conn.values,
    formats: formats.values,
    types: types.values,
    weightClass: isUltralight ? "ultraligero" : null,
    evidence: { confidence, matched },
  };
}

export function buildCatalogProductView(product: ProductLike) {
  const attributes = extractProductAttributes(product);
  return {
    id: product.id ?? product.slug,
    slug: product.slug,
    name: product.name,
    brand: product.brand ?? null,
    family: attributes.family,
    stock: product.stock ?? null,
    isInStock: (product.stock ?? 0) > 0,
    imageUrl: product.imageUrl ?? null,
    priceTransfer: product.priceTransfer ?? null,
    attributes,
    source: product,
  };
}