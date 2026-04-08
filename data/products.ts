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
  // =========================================================
  // BUILD REAL PUBLICADO
  // =========================================================
  {
    slug: "pc-gamer-ryzen-5-5600gt-16GB-ddr4-ssd-1tb",
    name: "PC Gamer Ryzen 5 5600GT",
    title: "PC Gamer Ryzen 5 5600 GT 6 núcleos + 16GB RAM + 1 TB SSD",
    kind: "PREBUILT_PC",
    category: "PREBUILT_PC",
    subcategory: "GAMER_ENTRADA_APU",
    brand: "RekaByte",
    sku: "PC-R5-5600GT-A520-1TB",
    shortDescription:
      "PC armado con Ryzen 5 5600GT, 16GB DDR4 RGB, SSD NVMe 1TB, fuente 650W PG5 Gold y gabinete ANTEC VCX20M RGB ELITE.",
    description:
      "Configuración real de entrada pensada para trabajo, estudio, uso diario y gaming liviano/esports con gráficos integrados Radeon. Incluye Ryzen 5 5600GT, 16GB DDR4 en dual channel, SSD NVMe Kingston NV3 de 1TB, fuente 650W PG5 Gold y gabinete ANTEC VCX20M RGB ELITE con 5 ventiladores incluidos. Mientras se arma la unidad final, la publicación puede usar imagen referencial y luego actualizarse con fotos reales del equipo terminado.",
    // Ajusta estos 3 valores si tu precio final cambia
    price: 750000,
    priceCard: 750000,
    priceTransfer: 750000,
    imageUrl: "/builds/antec.jpg",
    images: ["/builds/antec.jpg"],
    stock: 1,
    isActive: true,
    featured: true,
    badge: "Nuevo",
    sortOrder: 5,
    specs: {
      "Tarjeta de video": "Integrada Radeon Graphics",
      CPU: "AMD Ryzen 5 5600GT / 65W / AM4",
      "Placa madre": "Gigabyte A520M K V2",
      RAM: "2x8GB DDR4 3200MT/s XPG Spectrix RGB Black",
      "Unidad SSD": "Kingston NV3 1TB NVMe PCIe 4.0",
      "Fuente de poder": "650W PG5 Gold",
      Gabinete: "ANTEC VCX20M RGB ELITE - 5 ventiladores incluidos",
    },
    seoTitle: "PC Gamer Ryzen 5 5600GT + 16GB RAM + 1 TB SSD | RekaByte",
    seoDescription:
      "PC armado con Ryzen 5 5600GT, 16GB DDR4, SSD NVMe 1TB y gabinete ANTEC VCX20M RGB ELITE. Disponible en RekaByte.",
    gpu: "integrada-radeon",
    cpu: "amd-ryzen-5-5600gt",
    motherboard: "gigabyte-a520m-k-v2",
    ram: "16gb-ddr4",
    cabinet: "antec-vcx20m-rgb-elite",
    cabinetImage: "/builds/pc-gamer-ryzen-5-5600gt.jpg",
    games: ["minecraft", "valorant", "fortnite", "counter-strike-2"],
    tasks: ["trabajar-estudiar", "juegos"],
  },

  // =========================================================
  // EJEMPLOS DE BUILD (OCULTOS)
  // Se mantienen en código y BD como referencia, pero no públicos
  // =========================================================
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
    isActive: false,
    featured: false,
    badge: "Ejemplo",
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
    isActive: false,
    featured: false,
    badge: "Ejemplo",
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
    isActive: false,
    featured: false,
    badge: "Ejemplo",
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

  // =========================================================
  // PRODUCTOS UNITARIOS REALES
  // =========================================================
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
    stock: 0,
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
      "Bahías 3.5 / 2.5": "2 / 1",
      "Bahías 2.5": "1",
      "Slots de expansión": "4",
      "Ventiladores superiores": "2 x 120mm / 2 x 140mm",
      "Ventiladores sobre shroud PSU": "2 x 120mm",
      "Ventilador trasero": "1 x 120mm",
      "Ventiladores incluidos":
        "2 x 120mm RGB top + 2 x 120mm RGB reverse on PSU shroud + 1 x 120mm RGB rear",
      "Puertos frontales":
        "Power, LED On/Off, 2 x USB 3.0, Headphone/Mic Combo Jack",
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
  {
  slug: "fuente-gigabyte-650w-ice-silver",
  name: "Fuente Gigabyte 650W ICE Silver",
  title: "Fuente de Poder Gigabyte 650W ICE Silver",
  kind: "UNIT_PRODUCT",
  category: "PSU",
  subcategory: "ATX",
  brand: "Gigabyte",
  sku: "PSU-GB-650W-ICE-SILVER",
  shortDescription:
    "Fuente de poder 650W certificación Silver, eficiente y confiable para equipos gaming y workstation.",
  description:
    "La fuente Gigabyte 650W ICE Silver ofrece eficiencia energética con certificación 80 Plus Silver, ideal para configuraciones gaming y de trabajo. Diseño confiable, estable y preparada para builds modernas.",
  price: 0,
  priceCard: 0,
  priceTransfer: 0,
  imageUrl: "/products/fuente-gigabyte-650w-ice-silver/1.jpg",
  images: [
    "/products/fuente-gigabyte-650w-ice-silver/1.jpg",
    "/products/fuente-gigabyte-650w-ice-silver/2.jpg",
    "/products/fuente-gigabyte-650w-ice-silver/3.jpg",
    "/products/fuente-gigabyte-650w-ice-silver/4.jpg",
    "/products/fuente-gigabyte-650w-ice-silver/5.jpg",
    "/products/fuente-gigabyte-650w-ice-silver/6.jpg",
  ],
  stock: 0,
  isActive: true,
  featured: true,
  badge: null,
  sortOrder: 120,
  
  specs: {
    Potencia: "650W",
    Certificación: "80 Plus Silver",
    Formato: "ATX",
    Marca: "Gigabyte",
  },
  manufacturerPdfUrl:"https://www.gigabyte.com/Motherboard/B850M-EAGLE-WIFI6E-rev-10",
  seoTitle: "Fuente Gigabyte 650W ICE Silver | RekaByte",
  seoDescription:
    "Fuente de poder Gigabyte 650W ICE Silver disponible en RekaByte.",
},
{
  slug: "placa-madre-gigabyte-b850m-eagle-wifi6e",
  name: "Gigabyte B850M EAGLE WIFI6E",
  title: "Placa Madre Gigabyte B850M EAGLE WIFI6E",
  kind: "UNIT_PRODUCT",
  category: "MOTHERBOARD",
  subcategory: "Micro-ATX",
  brand: "Gigabyte",
  sku: "MB-GB-B850M-WF6E",
  shortDescription:
    "Placa madre AM5 con soporte DDR5 y conectividad WIFI 6E para builds modernas.",
  description:
    "La Gigabyte B850M EAGLE WIFI6E es una placa madre moderna con socket AM5, soporte para memorias DDR5 y conectividad inalámbrica WIFI 6E. Ideal para builds actuales con alto rendimiento y conectividad avanzada.",
  price: 999909,
  priceCard: 0,
  priceTransfer: 0,
  imageUrl: "/products/placa-madre-gigabyte-b850m-eagle-wifi6e/1.jpg",
  images: [
    "/products/placa-madre-gigabyte-b850m-eagle-wifi6e/1.jpg",
    "/products/placa-madre-gigabyte-b850m-eagle-wifi6e/2.jpg",
    "/products/placa-madre-gigabyte-b850m-eagle-wifi6e/3.jpg",
    "/products/placa-madre-gigabyte-b850m-eagle-wifi6e/4.jpg",
  ],
  stock: 0,
  isActive: true,
  featured: true,
  badge: null,
  sortOrder: 130,
  specs: {
    Socket: "AM5",
    Chipset: "B850",
    Formato: "Micro-ATX",
    Memoria: "DDR5",
    Conectividad: "WIFI 6E",
  },
  manufacturerPdfUrl: null,
  seoTitle: "Gigabyte B850M EAGLE WIFI6E | RekaByte",
  seoDescription:
    "Placa madre Gigabyte B850M EAGLE WIFI6E disponible en RekaByte.",
},

];