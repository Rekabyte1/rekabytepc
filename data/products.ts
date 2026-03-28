// data/products.ts

export type SeedProduct = {
  slug: string;
  name: string;
  title?: string;

  kind: "PREBUILT_PC" | "UNIT_PRODUCT";
  category:
    | "PREBUILT_PC"
    | "CPU"
    | "MOTHERBOARD"
    | "GPU"
    | "RAM"
    | "STORAGE"
    | "CASE"
    | "PSU"
    | "CPU_COOLER"
    | "CASE_FAN"
    | "THERMAL_PASTE"
    | "CABLE"
    | "MONITOR"
    | "PERIPHERAL"
    | "ACCESSORY"
    | "STREAMING"
    | "OTHER";

  subcategory?: string | null;
  brand?: string | null;
  sku?: string | null;

  shortDescription?: string | null;
  description?: string | null;

  price: number;
  priceCard: number;
  priceTransfer: number;

  imageUrl?: string | null;
  images?: string[];

  stock?: number;
  isActive?: boolean;

  specs?: Record<string, string>;
  manufacturerPdfUrl?: string | null;

  seoTitle?: string | null;
  seoDescription?: string | null;

  featured?: boolean;
  badge?: string | null;
  sortOrder?: number;

  // Solo para tu capa visual / filtros / juegos
  gpu?: string;
  cpu?: string;
  motherboard?: string;
  ram?: string;
  cabinet?: string;
  cabinetImage?: string;
  games?: string[];
  tasks?: string[];
};

export const products: SeedProduct[] = [
  {
    slug: "oficina-8600g",
    name: "OFICINA – 8600G",
    title: "OFICINA – 8600G",
    kind: "PREBUILT_PC",
    category: "PREBUILT_PC",
    subcategory: "OFICINA_APU",
    brand: "RekaByte",
    sku: "PC-OFI-8600G",
    shortDescription:
      "PC de oficina y uso general con Ryzen 5 8600G, 32GB DDR5 y SSD NVMe 1TB.",
    description:
      "Configuración pensada para trabajo, estudio y uso general con excelente fluidez, plataforma AM5 y almacenamiento NVMe. Ideal para quienes necesitan un equipo rápido, moderno y con posibilidad de crecimiento.",
    price: 750000,
    priceCard: 750000,
    priceTransfer: 750000,
    imageUrl: "/builds/oficina.jpg",
    images: ["/builds/oficina.jpg", "/builds/oficina2.jpg", "/builds/oficina3.jpg"],
    stock: 0,
    isActive: true,
    featured: true,
    badge: "Modelo",
    sortOrder: 10,
    specs: {
      "Tarjeta de video": "Integrada (RDNA3)",
      CPU: "Ryzen 5 8600G",
      "Placa madre": "B650",
      RAM: "2x16GB DDR5",
      "Unidad SSD": "NVMe 1 TB",
      "Fuente de poder": "650W 80+ Bronze",
      Gabinete: "Micro-ATX",
    },
    seoTitle: "OFICINA – 8600G | RekaByte",
    seoDescription:
      "PC de oficina con Ryzen 5 8600G, 32GB DDR5 y SSD NVMe 1TB. Compra en RekaByte.",
    gpu: "integrada-rdna3",
    cpu: "amd-ryzen-5-8600g",
    motherboard: "b650",
    ram: "32gb-ddr5",
    cabinet: "micro-atx",
    cabinetImage: "/builds/oficina.jpg",
    games: ["minecraft", "roblox", "fortnite"],
    tasks: ["trabajar-estudiar"],
  },
  {
    slug: "entrada-ryzen7-rtx5060",
    name: "ENTRADA – Ryzen 7 + RTX 5060",
    title: "ENTRADA – Ryzen 7 + RTX 5060",
    kind: "PREBUILT_PC",
    category: "PREBUILT_PC",
    subcategory: "GAMER_ENTRADA",
    brand: "RekaByte",
    sku: "PC-ENT-R7-5060",
    shortDescription:
      "PC gamer de entrada con RTX 5060, Ryzen 7, 32GB DDR5 y SSD NVMe 1TB.",
    description:
      "Build pensada para 1080p y entrada seria al gaming moderno. Buena base para Warzone, CS2, Fortnite y otros títulos competitivos con un equilibrio sólido entre rendimiento, estética y posibilidad de upgrade.",
    price: 930000,
    priceCard: 930000,
    priceTransfer: 890000,
    imageUrl: "/builds/entrada.jpg",
    images: ["/builds/entrada.jpg", "/builds/entrada.jpg", "/builds/entrada.jpg"],
    stock: 0,
    isActive: true,
    featured: true,
    badge: "Entrada",
    sortOrder: 20,
    specs: {
      "Tarjeta de video": "GeForce RTX 5060",
      CPU: "Ryzen 7 (AM5)",
      "Placa madre": "B650",
      RAM: "2x16GB DDR5",
      "Unidad SSD": "NVMe 1 TB",
      "Fuente de poder": "650W 80+ Bronze",
      Gabinete: "ATX airflow",
    },
    seoTitle: "ENTRADA – Ryzen 7 + RTX 5060 | RekaByte",
    seoDescription:
      "PC gamer con Ryzen 7 y RTX 5060 para 1080p competitivo. Compra en RekaByte.",
    gpu: "geforce-rtx-5060",
    cpu: "amd-ryzen-7",
    motherboard: "b650",
    ram: "32gb-ddr5",
    cabinet: "atx-airflow",
    cabinetImage: "/builds/entrada.jpg",
    games: ["counter-strike-2", "call-of-duty-warzone", "minecraft", "fortnite"],
    tasks: ["juegos", "streaming"],
  },
  {
    slug: "media-ryzen9-rx9060xt",
    name: "MEDIA – Ryzen 9 + RX 9060 XT",
    title: "MEDIA – Ryzen 9 + RX 9060 XT",
    kind: "PREBUILT_PC",
    category: "PREBUILT_PC",
    subcategory: "GAMER_MEDIA",
    brand: "RekaByte",
    sku: "PC-MED-R9-9060XT",
    shortDescription:
      "PC gamer media-alta con Ryzen 9, RX 9060 XT, 32GB DDR5 y SSD NVMe 2TB.",
    description:
      "Configuración para usuarios que buscan más margen de rendimiento, más almacenamiento y una plataforma superior para gaming pesado, multitarea y proyección de upgrades futuros.",
    price: 1200000,
    priceCard: 1200000,
    priceTransfer: 1150000,
    imageUrl: "/builds/media.jpg",
    images: ["/builds/media.jpg", "/builds/media.jpg", "/builds/media.jpg"],
    stock: 0,
    isActive: true,
    featured: true,
    badge: "Media",
    sortOrder: 30,
    specs: {
      "Tarjeta de video": "Radeon RX 9060 XT",
      CPU: "Ryzen 9 (AM5)",
      "Placa madre": "X670",
      RAM: "2x16GB DDR5",
      "Unidad SSD": "NVMe 2 TB",
      "Fuente de poder": "850W 80+ Gold",
      Gabinete: "ATX airflow",
    },
    seoTitle: "MEDIA – Ryzen 9 + RX 9060 XT | RekaByte",
    seoDescription:
      "PC gamer media-alta con Ryzen 9 y RX 9060 XT. Compra en RekaByte.",
    gpu: "radeon-rx-9060-xt",
    cpu: "amd-ryzen-9",
    motherboard: "x670",
    ram: "32gb-ddr5",
    cabinet: "atx-airflow",
    cabinetImage: "/builds/media.jpg",
    games: ["counter-strike-2", "call-of-duty-warzone", "minecraft", "fortnite"],
    tasks: ["juegos", "streaming", "juegos-2k"],
  },
  {
    slug: "gabinete-antec-vcx20m-rgb-elite-5-ventiladores-incluidos",
    name: "Gabinete ANTEC VCX20M RGB ELITE - 5 VENTILADORES INCLUIDOS",
    title: "Gabinete ANTEC VCX20M RGB ELITE - 5 VENTILADORES INCLUIDOS",
    kind: "UNIT_PRODUCT",
    category: "CASE",
    subcategory: "MICRO_ATX_MINI_ITX",
    brand: "ANTEC",
    sku: "GAB1",
    shortDescription:
      "Gabinete Mini Tower con panel lateral de vidrio templado y 5 ventiladores RGB incluidos.",
    description:
      "Gabinete compacto orientado a configuraciones Micro-ATX y Mini-ITX. Incluye 5 ventiladores RGB preinstalados, buen flujo de aire y compatibilidad sólida para builds compactas de entrada y gama media.",
    price: 41885,
    priceCard: 41885,
    priceTransfer: 39890,
    imageUrl: "/products/antec-vcx20m-rgb-elite/1.jpg",
    images: [
      "/products/antec-vcx20m-rgb-elite/1.jpg",
      "/products/antec-vcx20m-rgb-elite/2.jpg",
      "/products/antec-vcx20m-rgb-elite/3.jpg",
      "/products/antec-vcx20m-rgb-elite/4.jpg",
    ],
    stock: 2,
    isActive: true,
    featured: true,
    badge: "-13%",
    sortOrder: 100,
    manufacturerPdfUrl:
      "https://www.antec.com/documents/product/case-VCX20M%20RGB%20Elite_Flyer_EN_251230_OL.pdf",
    specs: {
      Formato: "Mini Tower",
      Dimensiones: "350 x 210 x 392 mm (DWH)",
      Materiales: "Steel",
      "Compatibilidad placa madre": "Micro-ATX, ITX",
      "Panel lateral": "Tempered Glass Side Panel",
      "Bahías 3.5 / 2.5": '2 / 1',
      'Bahías 2.5': "1",
      "Slots de expansión": "4",
      "Ventiladores superiores": "2 x 120mm / 2 x 140mm",
      "Ventiladores sobre shroud PSU": "2 x 120mm",
      "Ventilador trasero": "1 x 120mm",
      "Ventiladores incluidos":
        "2 x 120mm RGB top + 2 x 120mm RGB reverse on PSU shroud + 1 x 120mm RGB rear",
      "Puertos frontales": "Power, LED On/Off, 2 x USB 3.0, Headphone/Mic Combo Jack",
      "Largo máximo GPU": "≤ 330mm",
      "Altura máxima cooler CPU": "≤ 164mm",
      "Largo máximo PSU": "≤ 185mm (incluye cable)",
      "Filtros de polvo": "Top / Bottom",
      Garantía: "1 año",
    },
    seoTitle: "Gabinete ANTEC VCX20M RGB ELITE | RekaByte",
    seoDescription:
      "Gabinete ANTEC VCX20M RGB ELITE con 5 ventiladores incluidos, panel de vidrio templado y soporte Micro-ATX / ITX.",
  },
];