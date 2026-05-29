import type { FamilyConfig, SeoLandingConfig } from "./types";

export const COLOR_DICT = {
  black: { label: "Negro", aliases: ["black", "negro"], swatch: "#111111" },
  white: { label: "Blanco", aliases: ["white", "blanco"], swatch: "#f5f5f5" },
  red: { label: "Rojo", aliases: ["red", "rojo", "rose-red", "rose red"], swatch: "#d32f2f" },
  blue: { label: "Azul", aliases: ["blue", "azul", "navy"], swatch: "#1e40af" },
  yellow: { label: "Amarillo", aliases: ["yellow", "amarillo"], swatch: "#facc15" },
  purple: { label: "Morado", aliases: ["purple", "morado", "violet"], swatch: "#7c3aed" },
  pink: { label: "Rosado", aliases: ["pink", "rosado", "sakura"], swatch: "#ec4899" },
  green: { label: "Verde", aliases: ["green", "verde"], swatch: "#22c55e" },
  gray: { label: "Gris", aliases: ["gray", "grey", "gris"], swatch: "#6b7280" },
} as const;

export const SWITCH_DICT = {
  "hall-effect": { label: "Hall Effect", aliases: ["hall effect", "hall", "rapid trigger"] },
  taro: { label: "Taro", aliases: ["taro"] },
  red: { label: "Red", aliases: ["red switch", "switch red", "red"] },
  brown: { label: "Brown", aliases: ["brown switch", "switch brown", "brown"] },
  blue: { label: "Blue", aliases: ["blue switch", "switch blue", "blue"] },
} as const;

export const CONNECTIVITY_DICT = {
  wireless: { label: "Wireless", aliases: ["wireless", "inalambrico", "inalámbrico", "2.4g", "bluetooth"] },
  wired: { label: "Cableado", aliases: ["wired", "cableado"] },
  trimode: { label: "Trimodo", aliases: ["trimode", "tri-mode", "trimodo"] },
  usb: { label: "USB", aliases: ["usb", "usb-c", "usbc"] },
} as const;

export const FORMAT_DICT = {
  "60": { label: "60%", aliases: ["60%"] },
  "65": { label: "65%", aliases: ["65%"] },
  "75": { label: "75%", aliases: ["75%"] },
  tkl: { label: "TKL", aliases: ["tkl", "tenkeyless", "87"] },
  "full-size": { label: "Full Size", aliases: ["full size", "100%", "104"] },
  compacto: { label: "Compacto", aliases: ["compact", "compacto"] },
} as const;

export const TYPE_DICT = {
  magnetico: { label: "Magnético", aliases: ["magnetico", "magnético", "magnetic", "hall effect", "rapid trigger"] },
  mecanico: { label: "Mecánico", aliases: ["mecanico", "mecánico", "mechanical"] },
  membrana: { label: "Membrana", aliases: ["membrana", "membrane"] },
  wireless: { label: "Wireless", aliases: ["wireless", "inalambrico", "inalámbrico"] },
  ultraligero: { label: "Ultraligero", aliases: ["ultraligero", "ultralight", "lightweight", "47g", "52g"] },
  limitada: { label: "Edición limitada", aliases: ["edicion limitada", "edición limitada", "limited edition", "mori edition", "sakura edition"] },
} as const;

export const FAMILY_CONFIGS: Record<string, FamilyConfig> = {
  teclados: {
    key: "teclados",
    label: "Teclados",
    path: "/perifericos/teclados",
    allowedFacets: ["stock", "brand", "type", "color", "format", "connectivity", "switch"],
    seoLandings: ["magneticos", "mecanicos"],
    productMatcher: { categories: ["PERIPHERAL"], subcategories: ["KEYBOARD"] },
  },
  mouse: {
    key: "mouse",
    label: "Mouse",
    path: "/perifericos/mouse",
    allowedFacets: ["stock", "brand", "type", "color", "connectivity", "weightClass"],
    seoLandings: ["wireless", "ultraligeros"],
    productMatcher: { categories: ["PERIPHERAL"], subcategories: ["MOUSE"] },
  },
  audio: {
    key: "audio",
    label: "Audio",
    path: "/perifericos/audio",
    allowedFacets: ["stock", "brand", "color", "connectivity", "type"],
    seoLandings: [],
    productMatcher: { categories: ["PERIPHERAL"], subcategories: ["HEADSET", "SPEAKER", "AUDIO"] },
  },
  alfombrillas: {
    key: "alfombrillas",
    label: "Alfombrillas",
    path: "/perifericos/alfombrillas",
    allowedFacets: ["stock", "brand", "color", "type"],
    seoLandings: [],
    productMatcher: { categories: ["PERIPHERAL"], subcategories: ["MOUSEPAD"] },
  },
  streaming: {
    key: "streaming",
    label: "Streaming",
    path: "/streaming",
    allowedFacets: ["stock", "brand", "connectivity", "type"],
    seoLandings: [],
    productMatcher: { categories: ["STREAMING"] },
  },
  componentes: {
    key: "componentes",
    label: "Componentes",
    path: "/componentes",
    allowedFacets: ["stock", "brand", "type"],
    seoLandings: [],
    productMatcher: { categories: ["CASE", "PSU", "MOTHERBOARD", "CPU", "GPU", "RAM", "STORAGE", "CABLE", "MONITOR"] },
  },
};

export const SEO_LANDINGS: SeoLandingConfig[] = [
  {
    key: "magneticos",
    family: "teclados",
    path: "/perifericos/teclados/magneticos",
    priority: 100,
    seo: {
      h1: "Teclados Magnéticos",
      title: "Teclados Magnéticos en Chile | Hall Effect y Rapid Trigger - RekaByte",
      description: "Compra teclados magnéticos en Chile con Hall Effect, Rapid Trigger, actuación ajustable y baja latencia para gaming competitivo.",
    },
    matches: (a) => a.isMagnetic,
  },
  {
    key: "mecanicos",
    family: "teclados",
    path: "/perifericos/teclados/mecanicos",
    priority: 90,
    seo: {
      h1: "Teclados Mecánicos",
      title: "Teclados Mecánicos en Chile | Switches y Rendimiento - RekaByte",
      description: "Compra teclados mecánicos en Chile con switches táctiles, lineales y opciones RGB para gaming competitivo.",
    },
    matches: (a) => a.isMechanical && !a.isMagnetic,
  },
  {
    key: "wireless",
    family: "mouse",
    path: "/perifericos/mouse/wireless",
    priority: 80,
    seo: {
      h1: "Mouse Gamer Wireless",
      title: "Mouse Gamer Wireless en Chile | Baja Latencia - RekaByte",
      description: "Descubre mouse gamer wireless en Chile con baja latencia, precisión y autonomía para competitivo.",
    },
    matches: (a) => a.isWireless,
  },
  {
    key: "ultraligeros",
    family: "mouse",
    path: "/perifericos/mouse/ultraligeros",
    priority: 70,
    seo: {
      h1: "Mouse Ultraligeros",
      title: "Mouse Ultraligeros en Chile | FPS Competitivo - RekaByte",
      description: "Compra mouse ultraligeros en Chile para FPS competitivo, mejor control y menor fatiga.",
    },
    matches: (a) => a.isUltralight,
  },
];