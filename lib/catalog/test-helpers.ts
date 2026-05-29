import { buildCatalogProductView, extractProductAttributes } from "./attributes";
import { applyFacetFilters, buildFacets } from "./facets";
import { decideCanonical, resolveLandingByPriority } from "./seo";
import type { ProductLike } from "./types";

export function sampleMagneticKeyboard(): ProductLike {
  return {
    slug: "teclado-magnetico-demo",
    name: "Teclado Magnético Hall Effect",
    category: "PERIPHERAL",
    subcategory: "KEYBOARD",
    brand: "Demo",
    stock: 3,
    shortDescription: "Rapid Trigger con actuación ajustable",
    specs: { switch: "Hall Effect" },
  };
}

export function sampleWirelessMouse(): ProductLike {
  return {
    slug: "mouse-wireless-demo",
    name: "Mouse Wireless 47g",
    category: "PERIPHERAL",
    subcategory: "MOUSE",
    brand: "Demo",
    stock: 2,
    specs: { connectivity: "2.4G + Bluetooth" },
  };
}

export function sampleBlackMouse(): ProductLike {
  return {
    slug: "mouse-wg13e-tanto-e-black",
    name: "Mouse inalámbrico Fantech WG13E Tanto E Black",
    category: "PERIPHERAL",
    subcategory: "MOUSE",
    brand: "Fantech",
    stock: 5,
    description: "Disponible en Black, White, Blue, Green",
    specs: { color: "Black" },
  };
}

export function sampleWhiteMouse(): ProductLike {
  return {
    slug: "mouse-wg13e-tanto-e-white",
    name: "Mouse inalámbrico Fantech WG13E Tanto E White",
    category: "PERIPHERAL",
    subcategory: "MOUSE",
    brand: "Fantech",
    stock: 5,
    description: "Disponible en Black, White, Blue, Green",
    specs: { color: "White" },
  };
}

export function sampleKeyboardWithBlueSwitch(): ProductLike {
  return {
    slug: "teclado-mori-edition-blue-switch-taro",
    name: "Teclado Mori Edition Blue Switch Taro",
    category: "PERIPHERAL",
    subcategory: "KEYBOARD",
    brand: "Demo",
    stock: 4,
    specs: { switch: "Blue Switch", color: "Black" },
  };
}

export function runCatalogSmokeTests() {
  const kbd = sampleMagneticKeyboard();
  const mouse = sampleWirelessMouse();
  const blackMouse = sampleBlackMouse();
  const whiteMouse = sampleWhiteMouse();
  const blueSwitchKeyboard = sampleKeyboardWithBlueSwitch();

  const a1 = extractProductAttributes(kbd);
  const a2 = extractProductAttributes(mouse);
  const aBlack = extractProductAttributes(blackMouse);
  const aWhite = extractProductAttributes(whiteMouse);
  const aBlueSwitchKeyboard = extractProductAttributes(blueSwitchKeyboard);

  const products = [
    buildCatalogProductView(kbd),
    buildCatalogProductView(mouse),
    buildCatalogProductView(blackMouse),
    buildCatalogProductView(whiteMouse),
    buildCatalogProductView(blueSwitchKeyboard),
  ];

  const facets = buildFacets(products, "teclados", { type: ["magnetico"] });
  const landing = resolveLandingByPriority("teclados", products);
  const canonical = decideCanonical({
    baseUrl: "https://www.rekabyte.cl",
    family: "teclados",
    landing: "magneticos",
    hasQueryFilters: false,
    isValidLanding: true,
  });

  const blueFiltered = applyFacetFilters(products, {
    color: ["blue"],
  });

  return {
    magneticDetected: a1.isMagnetic,
    wirelessDetected: a2.isWireless,
    blackMouseColor: aBlack.colors,
    whiteMouseColor: aWhite.colors,
    blueSwitchDetected: aBlueSwitchKeyboard.switches,
    blueSwitchKeyboardColor: aBlueSwitchKeyboard.colors,
    blueColorFilteredSlugs: blueFiltered.map((p) => p.slug),
    facetsCount: facets.length,
    landingKey: landing?.key ?? null,
    canonical,
  };
}