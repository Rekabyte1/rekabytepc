import { ProductCategory, ProductKind } from "@prisma/client";

export type ShippingZone = "RM" | "NO_EXTREMA" | "EXTREMOS" | "UNKNOWN";
export type ComponentShippingSize = "SMALL" | "MEDIUM" | "LARGE" | "XL";

export type ShippingCartItem = {
  quantity: number;
  kind?: ProductKind | string | null;
  category?: ProductCategory | string | null;
  subcategory?: string | null;
  name?: string | null;
  slug?: string | null;
  priceTransfer?: number | null;
  price?: number | null;
};

function safeStr(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeText(v: unknown) {
  return safeStr(v)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeRegion(regionRaw: string) {
  return safeStr(regionRaw).toLowerCase();
}

export function zoneByRegion(regionRaw: string): ShippingZone {
  const r = normalizeRegion(regionRaw);
  if (!r) return "UNKNOWN";

  if (r.includes("metropolitana")) return "RM";

  if (
    r.includes("arica") ||
    r.includes("parinacota") ||
    r.includes("tarapac") ||
    r.includes("atacama") ||
    r.includes("ays") ||
    r.includes("magall")
  ) {
    return "EXTREMOS";
  }

  return "NO_EXTREMA";
}

export function pcShippingPerUnit(zone: ShippingZone, unitSubtotalTransfer: number) {
  if (zone === "EXTREMOS") return 20000;

  if (zone === "RM") {
    return unitSubtotalTransfer > 2_000_000 ? 12000 : 8000;
  }

  return unitSubtotalTransfer > 1_500_000 ? 15000 : 12000;
}

export function componentShippingBySize(
  zone: ShippingZone,
  size: ComponentShippingSize
) {
  const table: Record<
    ComponentShippingSize,
    Record<"RM" | "NO_EXTREMA" | "EXTREMOS", number>
  > = {
    SMALL: { RM: 3990, NO_EXTREMA: 5990, EXTREMOS: 7990 },
    MEDIUM: { RM: 4990, NO_EXTREMA: 7990, EXTREMOS: 9990 },
    LARGE: { RM: 6990, NO_EXTREMA: 10990, EXTREMOS: 14990 },
    XL: { RM: 8990, NO_EXTREMA: 13990, EXTREMOS: 17990 },
  };

  const normalizedZone = zone === "UNKNOWN" ? "NO_EXTREMA" : zone;
  return table[size][normalizedZone];
}

export function inferComponentShippingSize(product: {
  category?: ProductCategory | string | null;
  subcategory?: string | null;
  name?: string | null;
  slug?: string | null;
}): ComponentShippingSize {
  const category = safeStr(product.category).toUpperCase();
  const sub = normalizeText(product.subcategory);
  const name = normalizeText(product.name);
  const slug = normalizeText(product.slug);

  if (category === "MONITOR") return "XL";

  if (category === "CASE") {
    if (
      sub.includes("micro") ||
      sub.includes("mini") ||
      sub.includes("itx") ||
      sub.includes("matx")
    ) {
      return "LARGE";
    }
    return "XL";
  }

  if (category === "GPU" || category === "MOTHERBOARD") return "LARGE";

  if (
    category === "PSU" ||
    category === "CPU_COOLER" ||
    category === "CASE_FAN"
  ) {
    return "MEDIUM";
  }

  if (
    category === "CPU" ||
    category === "RAM" ||
    category === "STORAGE" ||
    category === "THERMAL_PASTE" ||
    category === "CABLE"
  ) {
    return "SMALL";
  }

  if (
    name.includes("monitor") ||
    slug.includes("monitor") ||
    name.includes("ultrawide")
  ) {
    return "XL";
  }

  if (
    name.includes("gabinete") ||
    slug.includes("gabinete") ||
    slug.includes("case")
  ) {
    if (
      name.includes("mini itx") ||
      name.includes("micro atx") ||
      slug.includes("mini-itx") ||
      slug.includes("micro-atx") ||
      slug.includes("matx")
    ) {
      return "LARGE";
    }
    return "XL";
  }

  if (
    name.includes("gpu") ||
    slug.includes("gpu") ||
    slug.includes("rtx") ||
    slug.includes("rx-")
  ) {
    return "LARGE";
  }

  // Ajuste comercial: mousepad/alfombrilla -> SMALL
  if (
    name.includes("mousepad") ||
    name.includes("alfombrilla") ||
    slug.includes("mousepad") ||
    slug.includes("alfombrilla")
  ) {
    return "SMALL";
  }

  // Mantener teclados/audífonos/webcams/micrófonos en MEDIUM
  if (
    name.includes("fuente") ||
    slug.includes("psu") ||
    name.includes("cooler") ||
    name.includes("disipador") ||
    name.includes("ventilador") ||
    name.includes("teclado") ||
    name.includes("audifono") ||
    name.includes("headset") ||
    name.includes("webcam") ||
    name.includes("microfono")
  ) {
    return "MEDIUM";
  }

  if (
    name.includes("mouse") ||
    name.includes("ram") ||
    name.includes("ssd") ||
    name.includes("nvme") ||
    name.includes("pasta termica") ||
    slug.includes("mouse") ||
    slug.includes("ram") ||
    slug.includes("ssd") ||
    slug.includes("nvme")
  ) {
    return "SMALL";
  }

  return "MEDIUM";
}

function isLargeItem(item: ShippingCartItem) {
  const kind = safeStr(item.kind).toUpperCase();
  const category = safeStr(item.category).toUpperCase();
  return (
    kind === "PREBUILT_PC" ||
    category === "CASE" ||
    category === "MONITOR"
  );
}

function isSmallEligibleItem(item: ShippingCartItem) {
  const category = safeStr(item.category).toUpperCase();
  if (
    category === "PERIPHERAL" ||
    category === "STREAMING" ||
    category === "ACCESSORY"
  ) {
    return true;
  }

  const text = `${normalizeText(item.name)} ${normalizeText(item.subcategory)} ${normalizeText(
    item.slug
  )}`;

  return (
    text.includes("mouse") ||
    text.includes("mousepad") ||
    text.includes("alfombrilla") ||
    text.includes("teclado") ||
    text.includes("audifono") ||
    text.includes("headset") ||
    text.includes("parlante") ||
    text.includes("microfono") ||
    text.includes("control")
  );
}

function smallOrderShipping(zone: ShippingZone) {
  if (zone === "RM") return 3990;
  if (zone === "EXTREMOS") return 7990;
  return 5990; // NO_EXTREMA + UNKNOWN
}

export function calculateShippingCost(params: {
  deliveryType: "pickup" | "shipping";
  region?: string | null;
  items: ShippingCartItem[];
}) {
  const { deliveryType, region, items } = params;

  if (deliveryType !== "shipping") return 0;

  const zone = zoneByRegion(region ?? "");
  const normalizedItems = (items ?? []).filter((i) => Number(i.quantity ?? 0) > 0);

  if (normalizedItems.length === 0) return 0;

  const hasLarge = normalizedItems.some(isLargeItem);

  // Regla final:
  // Si hay grande, SOLO cobrar grandes.
  // No sumar pequeña, no agrupar periféricos chicos.
  if (hasLarge) {
    let totalShipping = 0;

    for (const item of normalizedItems) {
      const quantity = Math.max(1, Number(item.quantity ?? 1));
      const kind = safeStr(item.kind).toUpperCase();
      const category = safeStr(item.category).toUpperCase();

      if (kind === "PREBUILT_PC") {
        const unitSubtotalTransfer = (item.priceTransfer ?? 0) || (item.price ?? 0);
        const perUnit = pcShippingPerUnit(zone, unitSubtotalTransfer);
        totalShipping += perUnit * quantity;
        continue;
      }

      if (category === "CASE") {
        const caseSize = inferComponentShippingSize(item);
        const perUnit = componentShippingBySize(zone, caseSize);
        totalShipping += perUnit * quantity;
        continue;
      }

      if (category === "MONITOR") {
        const perUnit = componentShippingBySize(zone, "XL");
        totalShipping += perUnit * quantity;
        continue;
      }

      // Cualquier no-grande se ignora para shipping adicional.
    }

    return totalShipping;
  }

  // Carrito solo pequeños => tarifa pequeña única por pedido
  const hasSmall = normalizedItems.some(isSmallEligibleItem);
  if (hasSmall) {
    return smallOrderShipping(zone);
  }

  // Fallback conservador
  return smallOrderShipping(zone);
}