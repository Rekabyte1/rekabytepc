export type PricingPaymentMethod = "transfer" | "card";

export type PricingProduct = {
  price: number;
  priceTransfer?: number | null;
  priceCard?: number | null;
  saleEnabled?: boolean | null;
  salePercent?: number | null;
  saleStartsAt?: Date | string | null;
  saleEndsAt?: Date | string | null;
  saleLabel?: string | null;
};

const MIN_SALE_PERCENT = 1;
const MAX_SALE_PERCENT = 90;

function toDate(input: Date | string | null | undefined) {
  if (!input) return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function clampPercent(percent: number | null | undefined) {
  if (typeof percent !== "number" || Number.isNaN(percent)) return null;
  const integer = Math.trunc(percent);
  if (integer < MIN_SALE_PERCENT || integer > MAX_SALE_PERCENT) return null;
  return integer;
}

export function isSaleActive(product: PricingProduct, now = new Date()) {
  if (!product.saleEnabled) return false;

  const percent = clampPercent(product.salePercent);
  if (!percent) return false;

  const startsAt = toDate(product.saleStartsAt);
  const endsAt = toDate(product.saleEndsAt);

  if (!startsAt || !endsAt) return false;
  if (startsAt.getTime() >= endsAt.getTime()) return false;

  const current = now.getTime();
  return current >= startsAt.getTime() && current <= endsAt.getTime();
}

export function resolveBasePrice(
  product: PricingProduct,
  paymentMethod: PricingPaymentMethod
) {
  if (paymentMethod === "card") {
    return (product.priceCard ?? 0) || product.price;
  }
  return (product.priceTransfer ?? 0) || product.price;
}

export function applyPercentDiscount(basePrice: number, percent: number) {
  const normalizedPercent = clampPercent(percent);
  if (!normalizedPercent) return basePrice;
  const discountAmount = Math.floor((basePrice * normalizedPercent) / 100);
  return Math.max(0, basePrice - discountAmount);
}

export function resolveFinalUnitPrice(
  product: PricingProduct,
  paymentMethod: PricingPaymentMethod,
  now = new Date()
) {
  const base = resolveBasePrice(product, paymentMethod);
  if (!isSaleActive(product, now)) return base;
  return applyPercentDiscount(base, product.salePercent ?? 0);
}

export function resolvePricingSnapshot(
  product: PricingProduct,
  paymentMethod: PricingPaymentMethod,
  now = new Date()
) {
  const base = resolveBasePrice(product, paymentMethod);
  const saleActive = isSaleActive(product, now);
  const salePercentApplied = saleActive ? clampPercent(product.salePercent) : null;
  const final = saleActive
    ? applyPercentDiscount(base, salePercentApplied ?? 0)
    : base;

  return {
    unitBasePrice: base,
    unitPrice: final,
    saleWasActive: saleActive,
    salePercent: salePercentApplied,
    saleLabel: saleActive ? product.saleLabel?.trim() || null : null,
    saleEndsAt: saleActive ? toDate(product.saleEndsAt)?.toISOString() ?? null : null,
  };
}

export function buildPriceView(product: PricingProduct, now = new Date()) {
  const active = isSaleActive(product, now);
  const percent = clampPercent(product.salePercent);

  const transferBase = resolveBasePrice(product, "transfer");
  const cardBase = resolveBasePrice(product, "card");

  return {
    transfer: {
      base: transferBase,
      final: active ? applyPercentDiscount(transferBase, percent ?? 0) : transferBase,
      active,
      discountPercent: active ? percent : null,
    },
    card: {
      base: cardBase,
      final: active ? applyPercentDiscount(cardBase, percent ?? 0) : cardBase,
      active,
      discountPercent: active ? percent : null,
    },
    sale: {
      active,
      label: product.saleLabel?.trim() || null,
      startsAt: toDate(product.saleStartsAt)?.toISOString() ?? null,
      endsAt: toDate(product.saleEndsAt)?.toISOString() ?? null,
    },
  };
}