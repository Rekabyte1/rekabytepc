// data/products.ts
type PremiumHighlight = {
  label: string;
  text: string;
};

type PremiumSectionHero = {
  type: "hero";
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  highlights?: PremiumHighlight[];
};

type PremiumSectionSplit = {
  type: "split";
  title: string;
  description?: string;
  image?: string;
  reverse?: boolean;
};

type PremiumSectionGridItem = {
  title: string;
  description?: string;
  image?: string;
};

type PremiumSectionGrid = {
  type: "grid";
  items: PremiumSectionGridItem[];
};

type PremiumSection =
  | PremiumSectionHero
  | PremiumSectionSplit
  | PremiumSectionGrid;

type ProductSpecs = Record<string, string | PremiumSection[]>;

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

  setupTier?: "SPAWN" | "LOADOUT" | "CLUTCH" | null;
  setupCategory?: "MOUSE" | "KEYBOARD" | "KEYBOARD_MOUSE_COMBO" | null;

  shortDescription?: string | null;
  description?: string | null;

  price: number;
  priceCard: number;
  priceTransfer: number;

  imageUrl?: string | null;
  images?: string[];

  stock?: number;
  isActive?: boolean;

  specs?: ProductSpecs;
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
    imageUrl: "/builds/Antec1.jpg",
    images: ["/builds/Antec1.jpg", "/builds/Antec2.jpg", "/builds/Antec3.jpg","/builds/Antec4.jpg"],
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
    imageUrl: "/builds/Antec1.jpg",
    images: ["/builds/Antec1.jpg", "/builds/Antec2.jpg", "/builds/Antec3.jpg","/builds/Antec4.jpg"],
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
    sku: "CASE-ANT-VCX20M-RGB",
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
    "La Gigabyte B850M EAGLE WIFI6E es una placa madre AM5 en Chile diseñada para builds modernos con procesadores AMD Ryzen de última generación. Ofrece soporte para memorias DDR5, conectividad WIFI 6E integrada y una base sólida para equipos de alto rendimiento, tanto en gaming como en productividad. Gracias a su formato Micro-ATX y conectividad avanzada, es una excelente opción para quienes buscan estabilidad, velocidad y futuras opciones de actualización en su PC.",
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
  manufacturerPdfUrl: "https://www.gigabyte.com/Motherboard/B850M-EAGLE-WIFI6E-rev-10",
  seoTitle: "Gigabyte B850M EAGLE WIFI6E | RekaByte",
  seoDescription:
    "Placa madre Gigabyte B850M EAGLE WIFI6E disponible en RekaByte.",
},
{
  slug: "mouse-fantech-x17-blake-space-edition",
  name: "Mouse Fantech X17 Blake Space Edition",
  title: "Mouse Fantech X17 Blake Space Edition",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "MOUSE",
  brand: "Fantech",
  sku: "X17BLAKESPE",
  shortDescription:
    "Mouse gamer RGB con sensor Pixart 3325, 7 botones programables y hasta 10.000 DPI.",
  description:
    "El Fantech X17 Blake Space Edition es un mouse gamer diseñado para precisión y comodidad. Integra sensor Pixart 3325, iluminación RGB Chroma, 7 botones macro programables, memoria interna y polling rate de 1000Hz para una respuesta rápida en juegos competitivos.",
  price: 13640,
  priceCard: 13640,
  priceTransfer: 12990,
  imageUrl: "/products/mouse-fantech-x17-blake-space-edition/1.jpg",
  images: [
    "/products/mouse-fantech-x17-blake-space-edition/1.jpg",
    "/products/mouse-fantech-x17-blake-space-edition/2.jpg",
    "/products/mouse-fantech-x17-blake-space-edition/3.jpg",
  ],
  stock: 4,
  isActive: true,
  featured: false,
  badge: null,
  sortOrder: 140,
  specs: {
    Sensor: "Pixart 3325",
    DPI: "10.000",
    Botones: "7 botones macro",
    Iluminación: "RGB Chroma",
    Memoria: "On Board Memory",
    IPS: "100",
    Polling: "1000 Hz",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/ficha-tecnica-mouse-gamer-fantech-x17-blake-rgb-precision-y-poder-en-tus-manos/",
  seoTitle: "Mouse Fantech X17 Blake Space Edition | RekaByte",
  seoDescription:
    "Mouse gamer Fantech X17 Blake Space Edition con RGB, sensor Pixart 3325 y 10.000 DPI disponible en RekaByte.",
},
{
  slug: "teclado-mecanico-fantech-atom-x83-mk612-ame-white-switch-taro",
  name: "Teclado mecánico Fantech ATOM X83 MK612 AME White (Switch Taro)",
  title: "Teclado mecánico Fantech ATOM X83 MK612 AME White (Switch Taro)",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "KEYBOARD",
  brand: "Fantech",
  sku: "MK612-AME-WHITE-STaro",
  shortDescription:
    "Teclado mecánico 75% hotswappable con RGB, switch Taro y conexión USB-C desmontable.",
  description:
    "El Fantech ATOM X83 MK612 AME White es un teclado mecánico 75% orientado a usuarios que buscan estética, personalización y buen tacto. Incluye switch Taro, sistema hotswappable 3 pines, full anti-ghosting, 11 modos RGB más panel lateral RGB, funciones para Windows y Mac y cable USB-C desmontable.",
  price: 41990,
  priceCard: 41990,
  priceTransfer: 39990,
  imageUrl:
    "/products/teclado-mecanico-fantech-atom-x83-mk612-ame-white-switch-taro/1.jpg",
  images: [
    "/products/teclado-mecanico-fantech-atom-x83-mk612-ame-white-switch-taro/1.jpg",
    "/products/teclado-mecanico-fantech-atom-x83-mk612-ame-white-switch-taro/2.jpg",
    "/products/teclado-mecanico-fantech-atom-x83-mk612-ame-white-switch-taro/3.jpg",
  ],
  stock: 4,
  isActive: true,
  featured: true,
  badge: "Nuevo",
  sortOrder: 150,
  specs: {
    Layout: "75%",
    Color: "White AME Edition",
    Switch: "Taro",
    Hotswappable: "Sí, 3 pin",
    AntiGhosting: "Full anti-ghosting",
    RGB: "11 modos RGB + panel lateral RGB",
    Compatibilidad: "Windows y Mac",
    Conexión: "USB-C desmontable",
    Personalización: "Software de personalización",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/antech-atom-x83-mk612-ame-edition-teclado-mecanico-75/",
  seoTitle:
    "Teclado mecánico Fantech ATOM X83 MK612 AME White (Switch Taro) | RekaByte",
  seoDescription:
    "Teclado mecánico Fantech ATOM X83 MK612 White con switch Taro, RGB y sistema hotswappable disponible en RekaByte.",
},
{
  slug: "audifonos-fantech-hg16-sniper-ii-rgb-black",
  name: "Audífonos Fantech HG16 Sniper II RGB Black",
  title: "Audífonos Fantech HG16 Sniper II RGB Black",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "HEADSET",
  brand: "Fantech",
  sku: "HG16S",
  shortDescription:
    "Audífonos gamer con sonido virtual 7.1, RGB, cancelación de ruido y conexión USB.",
  description:
    "Los Fantech HG16 Sniper II RGB Black ofrecen una experiencia gamer inmersiva gracias a su sonido virtual 7.1, iluminación RGB y micrófono con cancelación de ruido. Son una opción sólida para juegos, streaming casual y uso diario en PC.",
  price: 20990,
  priceCard: 20990,
  priceTransfer: 19990,
  imageUrl: "/products/audifonos-fantech-hg16-sniper-ii-rgb-black/1.jpg",
  images: [
    "/products/audifonos-fantech-hg16-sniper-ii-rgb-black/1.jpg",
    "/products/audifonos-fantech-hg16-sniper-ii-rgb-black/2.jpg",
    "/products/audifonos-fantech-hg16-sniper-ii-rgb-black/3.jpg",
    
  ],
  stock: 5,
  isActive: true,
  featured: false,
  badge: null,
  sortOrder: 160,
  specs: {
    Sonido: "7.1 Virtual USB",
    Iluminación: "RGB",
    Micrófono: "Con cancelación de ruido",
    Controles: "Control de volumen",
    Conectividad: "USB",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/ficha-tecnica-fantech-hg16-sniper-sonido-envolvente-7-1-y-estilo-gamer-con-iluminacion-rgb/",
  seoTitle: "Audífonos Fantech HG16 Sniper II RGB Black | RekaByte",
  seoDescription:
    "Audífonos gamer Fantech HG16 Sniper II RGB Black con sonido 7.1 virtual y cancelación de ruido disponibles en RekaByte.",
},
{
  slug: "parlantes-fantech-gs205-hellscream-rgb-black",
  name: "Parlantes Fantech GS205 HellScream RGB Black",
  title: "Parlantes Fantech GS205 HellScream RGB Black",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "SPEAKER",
  brand: "Fantech",
  sku: "GS205-BK",
  shortDescription:
    "Parlantes estéreo 2.0 con iluminación RGB, control de volumen y conexión 3.5 mm + USB.",
  description:
    "Los Fantech GS205 HellScream RGB Black son parlantes 2.0 pensados para setups gamer y uso diario. Ofrecen sonido estéreo, iluminación RGB tipo rainbow, control de volumen y conexión por jack 3.5 mm para audio más USB para alimentación.",
  price: 13640,
  priceCard: 13640,
  priceTransfer: 12990,
  imageUrl: "/products/parlantes-fantech-gs205-hellscream-rgb-black/1.jpg",
  images: [
    "/products/parlantes-fantech-gs205-hellscream-rgb-black/1.jpg",
    "/products/parlantes-fantech-gs205-hellscream-rgb-black/2.jpg",
    "/products/parlantes-fantech-gs205-hellscream-rgb-black/3.jpg",
  ],
  stock: 5,
  isActive: true,
  featured: false,
  badge: null,
  sortOrder: 170,
  specs: {
    Sonido: "Estéreo 2.0",
    Conectividad: "Jack 3.5 mm + USB",
    Potencia: "3W x 2 (6W RMS)",
    Frecuencia: "150 Hz – 15 kHz",
    Iluminación: "RGB dinámica rainbow",
    Cable: "1.2 m",
    Control: "Control de volumen",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/ficha-tecnica-fantech-gs205-hellscream-sonido-explosivo-y-estilo-rgb-para-tu-setup-gamer/",
  seoTitle: "Parlantes Fantech GS205 HellScream RGB Black | RekaByte",
  seoDescription:
    "Parlantes Fantech GS205 HellScream RGB Black con sonido estéreo 2.0 e iluminación RGB disponibles en RekaByte.",
},
{
  slug: "fuente-gigabyte-p650g-pg5-650w-80-plus-gold-pcie-5-1",
  name: "Fuente Gigabyte P650G PG5 650W 80 Plus Gold PCIe 5.1",
  title: "Fuente de Poder Gigabyte P650G PG5 650W 80 Plus Gold PCIe 5.1",
  kind: "UNIT_PRODUCT",
  category: "PSU",
  subcategory: "ATX",
  brand: "Gigabyte",
  sku: "PSU-GB-650W-GOLD",
  shortDescription:
    "Fuente de poder 650W con certificación 80 Plus Gold, lista para ATX 3.1 y PCIe Gen 5.1.",
  description:
    "La Gigabyte P650G PG5 es una fuente de poder de 650W preparada para plataformas modernas, con compatibilidad ATX 3.1 y PCIe Gen 5.1. Integra certificación 80 Plus Gold, capacitores japoneses principales, ventilador HYB silencioso de 120 mm, riel único +12V y protecciones eléctricas completas para una entrega de energía estable y confiable.",
  price: 60000,
  priceCard: 59935,
  priceTransfer: 57080,
  imageUrl: "/products/fuente-gigabyte-p650g-pg5/1.jpg",
  images: [
    "/products/fuente-gigabyte-p650g-pg5/1.jpg",
    "/products/fuente-gigabyte-p650g-pg5/2.jpg",
    "/products/fuente-gigabyte-p650g-pg5/3.jpg",
    "/products/fuente-gigabyte-p650g-pg5/4.jpg",
  ],
  stock: 1,
  isActive: true,
  featured: false,
  badge: null,
  sortOrder: 180,
  specs: {
    Potencia: "650W",
    Estándar: "ATX 3.1",
    PCIe: "PCIe Gen 5.1",
    Certificación: "80 Plus Gold",
    Ventilador: "120mm Silent Hydraulic Bearing (HYB)",
    Capacitores: "Main Japanese capacitors",
    Riel: "Single +12V rail",
    Protecciones: "OVP / OPP / SCP / UVP / OCP / OTP",
    Diseño: "Compacto",
    Garantía: "5 años",
  },
  manufacturerPdfUrl: "https://www.gigabyte.com/es/Power-Supply/GP-P650G-PG5",
  seoTitle: "Fuente Gigabyte P650G PG5 650W 80 Plus Gold PCIe 5.1 | RekaByte",
  seoDescription:
    "Fuente de poder Gigabyte P650G PG5 de 650W, 80 Plus Gold, compatible con ATX 3.1 y PCIe 5.1, disponible en RekaByte.",
},
{
  slug: "mouse-fantech-vx7-crypto-sakura-edition",
  name: "Mouse Fantech VX7 Crypto Sakura Edition",
  title: "Mouse Fantech VX7 Crypto Sakura Edition",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "MOUSE",
  brand: "Fantech",
  sku: "VX7-SKE",
  shortDescription:
    "Mouse gamer ambidiestro con iluminación, 6 botones macro y hasta 8.000 DPI.",
  description:
    "El Fantech VX7 Crypto Sakura Edition es un mouse gamer ambidiestro pensado para quienes buscan precisión, comodidad y un diseño llamativo. Integra hasta 8.000 DPI, 6 botones macro y modos de iluminación para complementar setups gamer, de estudio o trabajo. Su formato equilibrado permite un uso cómodo en sesiones prolongadas y lo convierte en una excelente alternativa para mejorar el control en juegos competitivos y uso diario.",
  price: 13640,
  priceCard: 13640,
  priceTransfer: 12990,
  imageUrl: "/products/mouse-fantech-vx7-crypto-sakura-edition/1.jpg",
  images: [
    "/products/mouse-fantech-vx7-crypto-sakura-edition/1.jpg",
    "/products/mouse-fantech-vx7-crypto-sakura-edition/2.jpg",
    "/products/mouse-fantech-vx7-crypto-sakura-edition/3.jpg",
  ],
  stock: 2,
  isActive: true,
  featured: false,
  badge: "Nuevo",
  sortOrder: 190,
  specs: {
    Diseño: "Ambidiestro",
    DPI: "8.000",
    Botones: "6 botones macro",
    Iluminación: "Lightning Modes",
    Color: "Sakura Edition",
    EAN: "1605185836622",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/ficha-tecnica-mouse-gamer-fantech-vx7-crypto-precision-ambidiestra-con-estilo/",
  seoTitle: "Mouse Fantech VX7 Crypto Sakura Edition | RekaByte",
  seoDescription:
    "Mouse gamer Fantech VX7 Crypto Sakura Edition con diseño ambidiestro, 6 botones macro, iluminación y hasta 8.000 DPI disponible en RekaByte.",
},
{
  slug: "mouse-inalambrico-fantech-wg13e-tanto-e-black",
  name: "Mouse inalámbrico Fantech WG13E Tanto E Black",
  title: "Mouse inalámbrico Fantech WG13E Tanto E Black",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "MOUSE",
  brand: "Fantech",
  sku: "WG13E-BK",
  shortDescription:
    "Mouse inalámbrico tri-modo de 57 g con sensor Pixart PAW3311, 12.000 DPI y dock RGB.",
  description:
    "El Fantech WG13E Tanto E Black es un mouse inalámbrico gamer de alto rendimiento, diseñado para quienes buscan precisión, baja latencia y comodidad. Incorpora sensor Pixart PAW3311 de hasta 12.000 DPI, conexión tri-modo por Bluetooth, 2.4 GHz y cable, polling rate de 1.000 Hz, switches Huano Green Shell y un peso liviano de 57 gramos. Incluye dock de carga RGB, software de configuración, batería recargable y autonomía de hasta 45 horas.",
  price: 41990,
  priceCard: 41990,
  priceTransfer: 39990,
  imageUrl: "/products/mouse-inalambrico-fantech-wg13e-tanto-e-black/1.jpg",
  images: [
    "/products/mouse-inalambrico-fantech-wg13e-tanto-e-black/1.jpg",
    "/products/mouse-inalambrico-fantech-wg13e-tanto-e-black/2.jpg",
    "/products/mouse-inalambrico-fantech-wg13e-tanto-e-black/3.jpg",
  ],
  stock: 2,
  isActive: true,
  featured: true,
  badge: "Nuevo",
  sortOrder: 200,
  specs: {
    Sensor: "Pixart PAW3311",
    DPI: "12.000",
    IPS: "300",
    Aceleración: "35G",
    Polling: "1.000 Hz",
    Conexión: "Bluetooth / 2.4 GHz / Cable",
    Switches: "Huano Green Shell",
    Botones: "5 botones macro",
    Peso: "57 g",
    Batería: "Recargable, hasta 45 horas de autonomía",
    Extras: "Dock de carga RGB + kit de pads antideslizantes",
    EAN: "6977052250452",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/mouse-fantech-wg13e-tanto-e-precision-extrema-y-versatilidad-total/",
  seoTitle: "Mouse inalámbrico Fantech WG13E Tanto E Black | RekaByte",
  seoDescription:
    "Mouse inalámbrico Fantech WG13E Tanto E Black con sensor Pixart PAW3311, 12.000 DPI, conexión tri-modo, dock RGB y 57 g disponible en RekaByte.",
},
{
  slug: "mouse-inalambrico-fantech-wg13e-tanto-e-white",
  name: "Mouse inalámbrico Fantech WG13E Tanto E White",
  title: "Mouse inalámbrico Fantech WG13E Tanto E White",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "MOUSE",
  brand: "Fantech",
  sku: "WG13E-White",
  shortDescription:
    "Mouse inalámbrico tri-modo blanco de 57 g con sensor Pixart PAW3311, 12.000 DPI y dock RGB.",
  description:
    "El Fantech WG13E Tanto E White combina diseño limpio, conectividad moderna y alto rendimiento para gaming competitivo o uso diario. Cuenta con sensor Pixart PAW3311 de hasta 12.000 DPI, conexión tri-modo por Bluetooth, 2.4 GHz y cable, polling rate de 1.000 Hz, switches Huano Green Shell y un peso de solo 57 gramos. Incluye dock de carga RGB, software de configuración, batería recargable y autonomía de hasta 45 horas.",
  price: 41990,
  priceCard: 41990,
  priceTransfer: 39990,
  imageUrl: "/products/mouse-inalambrico-fantech-wg13e-tanto-e-white/1.jpg",
  images: [
    "/products/mouse-inalambrico-fantech-wg13e-tanto-e-white/1.jpg",
    "/products/mouse-inalambrico-fantech-wg13e-tanto-e-white/2.jpg",
    "/products/mouse-inalambrico-fantech-wg13e-tanto-e-white/3.jpg",
  ],
  stock: 2,
  isActive: true,
  featured: true,
  badge: "Nuevo",
  sortOrder: 210,
  specs: {
    Sensor: "Pixart PAW3311",
    DPI: "12.000",
    IPS: "300",
    Aceleración: "35G",
    Polling: "1.000 Hz",
    Conexión: "Bluetooth / 2.4 GHz / Cable",
    Switches: "Huano Green Shell",
    Botones: "5 botones macro",
    Peso: "57 g",
    Batería: "Recargable, hasta 45 horas de autonomía",
    Extras: "Dock de carga RGB + kit de pads antideslizantes",
    EAN: "6977052250469",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/mouse-fantech-wg13e-tanto-e-precision-extrema-y-versatilidad-total/",
  seoTitle: "Mouse inalámbrico Fantech WG13E Tanto E White | RekaByte",
  seoDescription:
    "Mouse inalámbrico Fantech WG13E Tanto E White con sensor Pixart PAW3311, 12.000 DPI, conexión tri-modo, dock RGB y 57 g disponible en RekaByte.",
},
{
  slug: "mouse-inalambrico-fantech-wgc2-venom-ii-yellow",
  name: "Mouse inalámbrico Fantech WGC2 Venom II Yellow",
  title: "Mouse inalámbrico Fantech WGC2 Venom II Yellow",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "MOUSE",
  brand: "Fantech",
  sku: "WGC2-Yellow",
  shortDescription:
    "Mouse inalámbrico recargable con sensor Pixart 3212, hasta 2.400 DPI y batería de 300 mAh.",
  description:
    "El Fantech WGC2 Venom II Yellow es un mouse inalámbrico gamer pensado para quienes buscan libertad de movimiento, diseño llamativo y buena respuesta para uso diario. Integra sensor Pixart 3212, sensibilidad ajustable entre 800 y 2.400 DPI, tasa de sondeo de 125 Hz y batería recargable de 300 mAh. Su alcance inalámbrico de hasta 10 metros y vida útil de 20 millones de clics lo convierten en una alternativa práctica para setups gamer, oficina o estudio.",
  price: 20990,
  priceCard: 20990,
  priceTransfer: 19990,
  imageUrl: "/products/mouse-inalambrico-fantech-wgc2-venom-ii-yellow/1.jpg",
  images: [
    "/products/mouse-inalambrico-fantech-wgc2-venom-ii-yellow/1.jpg",
    "/products/mouse-inalambrico-fantech-wgc2-venom-ii-yellow/2.jpg",
    "/products/mouse-inalambrico-fantech-wgc2-venom-ii-yellow/3.jpg",
  ],
  stock: 2,
  isActive: true,
  featured: false,
  badge: "Nuevo",
  sortOrder: 220,
  specs: {
    Sensor: "Pixart 3212",
    DPI: "800 - 2.400",
    Polling: "125 Hz",
    "Vida útil": "20.000.000 clics",
    Batería: "300 mAh recargable",
    Alcance: "Hasta 10 metros",
    Color: "Yellow",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/mouse-inalambrico-gamer-fantech-wgc2-venom-ii-rendimiento-en-libertad/",
  seoTitle: "Mouse inalámbrico Fantech WGC2 Venom II Yellow | RekaByte",
  seoDescription:
    "Mouse inalámbrico Fantech WGC2 Venom II Yellow con sensor Pixart 3212, batería recargable y hasta 2.400 DPI disponible en RekaByte.",
},
{
  slug: "mousepad-fantech-mp70-xl-basic-purple",
  name: "Mousepad Fantech MP70 XL Basic Purple",
  title: "Mousepad Fantech MP70 XL Basic Purple",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "MOUSE",
  brand: "Fantech",
  sku: "MP70-Purple",
  shortDescription:
    "Mousepad XL de 700 x 300 x 3 mm con base antideslizante, orillas bordadas y superficie cómoda.",
  description:
    "El Fantech MP70 XL Basic Purple es un mousepad amplio y cómodo para setups gamer, trabajo o estudio. Su tamaño de 700 x 300 x 3 mm permite apoyar mouse y teclado con mayor libertad, mientras que la base antideslizante ayuda a mantener estabilidad durante el uso. Sus orillas bordadas mejoran la durabilidad y su superficie entrega un equilibrio adecuado entre control y confort para movimientos precisos.",
  price: 10490,
  priceCard: 10490,
  priceTransfer: 9990,
  imageUrl: "/products/mousepad-fantech-mp70-xl-basic-purple/1.jpg",
  images: [
    "/products/mousepad-fantech-mp70-xl-basic-purple/1.jpg",
    "/products/mousepad-fantech-mp70-xl-basic-purple/2.jpg",

  ],
  stock: 2,
  isActive: true,
  featured: false,
  badge: "Nuevo",
  sortOrder: 230,
  specs: {
    Dimensiones: "700 x 300 x 3 mm",
    Base: "Antideslizante",
    Bordes: "Orillas bordadas",
    Superficie: "Control y confort",
    Color: "Purple",
    EAN: "6977052250940",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/mousepad-fantech-mp70-basic-desk-mat-control-y-comodidad-en-cada-movimiento/",
  seoTitle: "Mousepad Fantech MP70 XL Basic Purple | RekaByte",
  seoDescription:
    "Mousepad Fantech MP70 XL Basic Purple de 700 x 300 x 3 mm con base antideslizante y orillas bordadas disponible en RekaByte.",
},
{
  slug: "mousepad-fantech-mp64-xl-black",
  name: "Mousepad Fantech MP64 XL Black",
  title: "Mousepad Fantech MP64 XL Black",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "MOUSEPAD",
  brand: "Fantech",
  sku: "MP64XL-BK",
  shortDescription:
    "Mousepad XL negro de 640 x 210 x 3 mm, ideal para escritorio, gaming y uso diario.",
  description:
    "El Fantech MP64 XL Black es un mousepad práctico y cómodo para quienes buscan mejorar el espacio de uso del mouse sin ocupar demasiado escritorio. Con dimensiones de 640 x 210 x 3 mm, entrega una superficie amplia para movimientos fluidos en gaming, trabajo o estudio. Su diseño negro combina fácilmente con distintos setups y ofrece una base funcional para mejorar precisión, comodidad y orden en el escritorio.",
  price: 5240,
  priceCard: 5240,
  priceTransfer: 4990,
  imageUrl: "/products/mousepad-fantech-mp64-xl-black/1.jpg",
  images: [
    "/products/mousepad-fantech-mp64-xl-black/1.jpg",
    "/products/mousepad-fantech-mp64-xl-black/2.jpg",
    "/products/mousepad-fantech-mp64-xl-black/3.jpg",
  ],
  stock: 2,
  isActive: true,
  featured: false,
  badge: "Nuevo",
  sortOrder: 240,
  specs: {
    Dimensiones: "640 x 210 x 3 mm",
    Color: "Black",
    Formato: "XL",
    Uso: "Gaming, trabajo y escritorio",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/mousepad-fantech-mp64-xl-espacio-comodo-trabajo-fluido/",
  seoTitle: "Mousepad Fantech MP64 XL Black | RekaByte",
  seoDescription:
    "Mousepad Fantech MP64 XL Black de 640 x 210 x 3 mm para gaming, trabajo y uso diario disponible en RekaByte.",
},
{
  slug: "teclado-mecanico-fantech-mk875v2-atom81-rgb-navy-switch-blue",
  name: "Teclado mecánico Fantech MK875V2 ATOM81 RGB Navy Switch Blue",
  title: "Teclado mecánico Fantech MK875V2 ATOM81 RGB Navy Edition Switch Blue",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "KEYBOARD",
  brand: "Fantech",
  sku: "MK875V2-Navy-Blue",
  shortDescription:
    "Teclado mecánico 80% USB hotswappable con switch Blue, 17 modos RGB y control de volumen.",
  description:
    "El Fantech MK875V2 ATOM81 RGB Navy Edition es un teclado mecánico compacto 80% diseñado para quienes buscan respuesta táctil, estética y funcionalidad. Integra switches Blue intercambiables de 3 pines, 17 modos de iluminación RGB, 26 teclas anti-ghosting, altura ajustable y control de volumen. Su formato compacto permite ahorrar espacio en el escritorio sin perder teclas importantes para gaming, escritura o productividad.",
  price: 36740,
  priceCard: 36740,
  priceTransfer: 34990,
  imageUrl:
    "/products/teclado-mecanico-fantech-mk875v2-atom81-rgb-navy-switch-blue/1.jpg",
  images: [
    "/products/teclado-mecanico-fantech-mk875v2-atom81-rgb-navy-switch-blue/1.jpg",
    "/products/teclado-mecanico-fantech-mk875v2-atom81-rgb-navy-switch-blue/2.jpg",
    "/products/teclado-mecanico-fantech-mk875v2-atom81-rgb-navy-switch-blue/3.jpg",
  ],
  stock: 2,
  isActive: true,
  featured: true,
  badge: "Nuevo",
  sortOrder: 250,
  specs: {
    Layout: "80%",
    Switch: "Blue / USA",
    Hotswappable: "Sí, 3 pin",
    RGB: "17 modos RGB",
    AntiGhosting: "26 teclas anti-ghosting",
    Altura: "Ajustable",
    Control: "Control de volumen",
    Conexión: "USB",
    Color: "Navy Edition",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/ficha-tecnica-teclado-mecanico-fantech-mk875v2-atom81-precision-compacta-con-estilo-rgb/",
  seoTitle:
    "Teclado mecánico Fantech MK875V2 ATOM81 RGB Navy Switch Blue | RekaByte",
  seoDescription:
    "Teclado mecánico Fantech MK875V2 ATOM81 RGB Navy Edition 80%, hotswappable, switch Blue y 17 modos RGB disponible en RekaByte.",
},
{
  slug: "teclado-mecanico-fantech-mk877s-atom87s-mori-edition-blue-switch-taro",
  name: "Teclado mecánico Fantech MK877s ATOM87s Mori Edition Blue Switch Taro",
  title:
    "Teclado mecánico Fantech MK877s ATOM87s Mori Edition Blue Switch Taro",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "KEYBOARD",
  brand: "Fantech",
  sku: "MK877s-MORI-BLUE-STaro",
  shortDescription:
    "Teclado mecánico 80% hotswappable con switch Taro, USB-C desmontable, RGB y keycaps double shot.",
  description:
    "El Fantech MK877s ATOM87s Mori Edition Blue es un teclado mecánico tenkeyless pensado para setups modernos, gaming y escritura cómoda. Incluye switches Taro, sistema hotswappable de 3 pines, conexión USB-C desmontable, keycaps double shot y 12 efectos de iluminación RGB. Su formato 80% entrega una buena combinación entre espacio, funcionalidad y comodidad, con compatibilidad para Windows y Mac.",
  price: 36740,
  priceCard: 36740,
  priceTransfer: 34990,
  imageUrl:
    "/products/teclado-mecanico-fantech-mk877s-atom87s-mori-edition-blue-switch-taro/1.jpg",
  images: [
    "/products/teclado-mecanico-fantech-mk877s-atom87s-mori-edition-blue-switch-taro/1.jpg",
    "/products/teclado-mecanico-fantech-mk877s-atom87s-mori-edition-blue-switch-taro/2.jpg",
    "/products/teclado-mecanico-fantech-mk877s-atom87s-mori-edition-blue-switch-taro/3.jpg",
  ],
  stock: 2,
  isActive: true,
  featured: true,
  badge: "Nuevo",
  sortOrder: 260,
  specs: {
    Layout: "80% / Tenkeyless",
    Switch: "Taro / USA",
    Hotswappable: "Sí, 3 pin",
    AntiGhosting: "25 teclas anti-ghosting",
    Conexión: "USB-C desmontable",
    Keycaps: "Double Shot",
    Altura: "Doble ajuste de altura",
    RGB: "12 efectos de iluminación RGB",
    Compatibilidad: "Windows y Mac",
    Color: "Mori Edition Blue",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/teclado-mecanico-fantech-mk877s-atom87s-rendimiento-y-personalizacion-en-formato-tenkeyless/",
  seoTitle:
    "Teclado mecánico Fantech MK877s ATOM87s Mori Edition Blue Switch Taro | RekaByte",
  seoDescription:
    "Teclado mecánico Fantech MK877s ATOM87s Mori Edition Blue 80%, hotswappable, switch Taro, USB-C y RGB disponible en RekaByte.",
},
{
  slug: "mouse-inalambrico-fantech-wgc2-venom-ii-red",
  name: "Mouse inalámbrico Fantech WGC2 Venom II Red",
  title: "Mouse inalámbrico Fantech WGC2 Venom II Red",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "MOUSE",
  brand: "Fantech",
  sku: "WGC2-Red",
  shortDescription:
    "Mouse inalámbrico recargable con sensor Pixart 3212, hasta 2.400 DPI y batería de 300 mAh.",
  description:
    "El Fantech WGC2 Venom II Red es un mouse inalámbrico gamer con diseño llamativo, batería recargable y respuesta adecuada para uso diario, gaming casual y escritorio. Integra sensor Pixart 3212, sensibilidad ajustable entre 800 y 2.400 DPI, tasa de sondeo de 125 Hz y vida útil de hasta 20 millones de clics. Su alcance inalámbrico de hasta 10 metros permite mayor libertad de movimiento sin depender de cables.",
  price: 20990,
  priceCard: 20990,
  priceTransfer: 19990,
  imageUrl: "/products/mouse-inalambrico-fantech-wgc2-venom-ii-red/1.jpg",
  images: [
    "/products/mouse-inalambrico-fantech-wgc2-venom-ii-red/1.jpg",
    "/products/mouse-inalambrico-fantech-wgc2-venom-ii-red/2.jpg",
    "/products/mouse-inalambrico-fantech-wgc2-venom-ii-red/3.jpg",
  ],
  stock: 2,
  isActive: true,
  featured: false,
  badge: "Nuevo",
  sortOrder: 270,
  specs: {
    Sensor: "Pixart 3212",
    DPI: "800 - 2.400",
    Polling: "125 Hz",
    "Vida útil": "20.000.000 clics",
    Batería: "300 mAh recargable",
    Alcance: "Hasta 10 metros",
    Color: "Red",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/mouse-inalambrico-gamer-fantech-wgc2-venom-ii-rendimiento-en-libertad/",
  seoTitle: "Mouse inalámbrico Fantech WGC2 Venom II Red | RekaByte",
  seoDescription:
    "Mouse inalámbrico Fantech WGC2 Venom II Red con sensor Pixart 3212, batería recargable y hasta 2.400 DPI disponible en RekaByte.",
},
{
  slug: "microfono-fantech-mcx03-leviosa-max-rgb-black",
  name: "Micrófono Fantech MCX03 Leviosa Max RGB Black",
  title: "Micrófono Condensador Fantech MCX03 Leviosa Max RGB Black",
  kind: "UNIT_PRODUCT",
  category: "STREAMING",
  subcategory: "MICROPHONE",
  brand: "Fantech",
  sku: "MCX03-Black",
  shortDescription:
    "Micrófono condensador cardioide USB-C con RGB, 192 kHz / 24 bits, reducción de ruido y control de ganancia.",
  description:
    "El Fantech MCX03 Leviosa Max RGB Black es un micrófono condensador cardioide orientado a streaming, creación de contenido, reuniones y grabación de voz. Ofrece calidad de captura de hasta 192 kHz / 24 bits, cápsula condensadora de 16 mm, reducción de ruido, control de monitoreo, control de ganancia y función mute desde el panel. Su interfaz USB-C facilita la conexión directa al PC, mientras que la iluminación RGB complementa setups gamer y de contenido.",
  price: 47240,
  priceCard: 47240,
  priceTransfer: 44990,
  imageUrl: "/products/microfono-fantech-mcx03-leviosa-max-rgb-black/1.jpg",
  images: [
    "/products/microfono-fantech-mcx03-leviosa-max-rgb-black/1.jpg",
    "/products/microfono-fantech-mcx03-leviosa-max-rgb-black/2.jpg",
    "/products/microfono-fantech-mcx03-leviosa-max-rgb-black/3.jpg",
    "/products/microfono-fantech-mcx03-leviosa-max-rgb-black/4.jpg",
  ],
  stock: 2,
  isActive: true,
  featured: true,
  badge: "Nuevo",
  sortOrder: 280,
  specs: {
    Tipo: "Micrófono condensador",
    Patrón: "Cardioide",
    Calidad: "192 kHz / 24 bits",
    Cápsula: "16 mm",
    "Reducción de ruido": "Sí",
    Monitoreo: "Control de monitoreo",
    Ganancia: "Control de ganancia",
    Mute: "Mute panel",
    Interfaz: "USB-C",
    Iluminación: "RGB",
    EAN: "6972661280890",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/ficha-tecnica-microfono-fantech-mcx03-leviosa-max-rgb-calidad-de-estudio-con-estilo-gamer/",
  seoTitle: "Micrófono Fantech MCX03 Leviosa Max RGB Black | RekaByte",
  seoDescription:
    "Micrófono condensador Fantech MCX03 Leviosa Max RGB Black cardioide, USB-C, 192 kHz / 24 bits y reducción de ruido disponible en RekaByte.",
},
{
  slug: "mousepad-fantech-mpr351s-firefly-rgb-black",
  name: "Mousepad Fantech MPR351s Firefly RGB Black",
  title: "Mousepad Fantech MPR351s Firefly RGB Black",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "MOUSEPAD",
  brand: "Fantech",
  sku: "MPR351",
  shortDescription:
    "Mousepad RGB de 350 x 250 mm con base antideslizante, superficie optimizada y 14 modos de iluminación.",
  description:
    "El Fantech MPR351s Firefly RGB Black es un mousepad compacto con iluminación RGB en los bordes, ideal para mejorar la estética del setup sin ocupar demasiado espacio. Cuenta con superficie optimizada para velocidad y control, base de goma antideslizante, material resistente a humedad y derrames, y 14 modos de iluminación RGB. Es una buena opción para quienes buscan un accesorio funcional, llamativo y accesible para gaming o uso diario.",
  price: 9440,
  priceCard: 9440,
  priceTransfer: 8990,
  imageUrl: "/products/mousepad-fantech-mpr351s-firefly-rgb-black/1.jpg",
  images: [
    "/products/mousepad-fantech-mpr351s-firefly-rgb-black/1.jpg",
    "/products/mousepad-fantech-mpr351s-firefly-rgb-black/2.jpg",
    "/products/mousepad-fantech-mpr351s-firefly-rgb-black/3.jpg",
  ],
  stock: 2,
  isActive: true,
  featured: false,
  badge: "Nuevo",
  sortOrder: 290,
  specs: {
    Dimensiones: "350 x 250 mm",
    Superficie: "Optimizada para velocidad y control",
    Base: "Goma antideslizante",
    Iluminación: "RGB en bordes",
    Modos: "14 modos de iluminación RGB",
    Material: "Resistente a humedad y derrames",
    Color: "Black",
    EAN: "1551972946920",
  },
  manufacturerPdfUrl:
    "https://quantumimport.cl/ficha-tecnica-mousepad-fantech-firefly-ilumina-tu-experiencia/",
  seoTitle: "Mousepad Fantech MPR351s Firefly RGB Black | RekaByte",
  seoDescription:
    "Mousepad Fantech MPR351s Firefly RGB Black con iluminación RGB, base antideslizante y superficie optimizada disponible en RekaByte.",
  
    
},
{
  slug: "mouse-lamzu-maya-x-grey",
  name: "Mouse Lamzu Maya X Wireless Grey",
  title: "Mouse Lamzu Maya X Wireless Grey",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "MOUSE",
  brand: "Lamzu",
  sku: "LAMZU-MAYA-X-GREY",
  shortDescription:
    "Mouse gamer inalámbrico premium ultraligero, diseñado para competitivo, con sensor de alto rendimiento y soporte para polling rate 8K.",
  description:
    "El Lamzu Maya X Wireless Grey es un mouse gamer premium orientado a jugadores competitivos que buscan velocidad, control y una sensación ultraligera. Su formato simétrico, conectividad inalámbrica y enfoque esports lo convierten en una opción ideal para shooters competitivos como Valorant, Counter-Strike 2, Apex Legends y juegos donde cada movimiento importa.",
  price: 209990,
  priceTransfer: 199990,
  priceCard: 209990,
  imageUrl: "/products/mouse-lamzu-maya-x-grey/1.jpg",
  images: [
    "/products/mouse-lamzu-maya-x-grey/1.jpg",
    "/products/mouse-lamzu-maya-x-grey/2.jpg",
    "/products/mouse-lamzu-maya-x-grey/3.jpg",
    "/products/mouse-lamzu-maya-x-grey/4.jpg",
    "/products/mouse-lamzu-maya-x-grey/5.jpg",
  ],
  stock: 1,
  isActive: true,
  featured: true,
  badge: "Próximamente",
  sortOrder: 100,
  specs: {
    Modelo: "Lamzu Maya X",
    Color: "Grey",
    Peso: "47 g aprox.",
    Sensor: "PixArt PAW3950",
    DPI: "Hasta 30.000 DPI",
    Conectividad: "Wireless / USB-C",
    PollingRate: "Hasta 8000 Hz",
    Bateria: "Hasta 80 horas aprox.",
    Formato: "Simétrico",
    Uso: "Gaming competitivo / esports",
  },
  manufacturerPdfUrl: null,
  seoTitle: "Mouse Lamzu Maya X Wireless Grey | RekaByte Chile",
  seoDescription:
    "Mouse Lamzu Maya X Wireless Grey en Chile. Mouse gamer premium ultraligero para competitivo, sensor PAW3950, polling 8K y diseño esports.",
},
{
  slug: "mouse-lamzu-maya-x-black",
  name: "Mouse Lamzu Maya X Wireless Black",
  title: "Mouse Lamzu Maya X Wireless Black",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "MOUSE",
  brand: "Lamzu",
  sku: "LAMZU-MAYA-X-BLACK",
  shortDescription:
    "Mouse gamer inalámbrico premium ultraligero en color black, orientado a competitivo con sensor de alto rendimiento y respuesta 8K.",
  description:
    "El Lamzu Maya X Wireless Black es una alternativa premium para jugadores que buscan un mouse liviano, preciso y con estética sobria. Está pensado para rendimiento competitivo, movimientos rápidos y control consistente en sesiones intensas de FPS, aim training y uso diario exigente.",
  price: 209990,
  priceTransfer: 199990,
  priceCard: 209990,
  imageUrl: "/products/mouse-lamzu-maya-x-black/1.jpg",
  images: [
    "/products/mouse-lamzu-maya-x-black/1.jpg",
    "/products/mouse-lamzu-maya-x-black/2.jpg",
    "/products/mouse-lamzu-maya-x-black/3.jpg",
    "/products/mouse-lamzu-maya-x-black/4.jpg",
    "/products/mouse-lamzu-maya-x-black/5.jpg",
  ],
  stock: 1,
  isActive: true,
  featured: true,
  badge: "Próximamente",
  sortOrder: 101,
  specs: {
    Modelo: "Lamzu Maya X",
    Color: "Black",
    Peso: "47 g aprox.",
    Sensor: "PixArt PAW3950",
    DPI: "Hasta 30.000 DPI",
    Conectividad: "Wireless / USB-C",
    PollingRate: "Hasta 8000 Hz",
    Bateria: "Hasta 80 horas aprox.",
    Formato: "Simétrico",
    Uso: "Gaming competitivo / esports",

premiumSections: [
  {
    type: "hero",
    eyebrow: "LAMZU MAYA X",
    title: "ULTRA LIGHTWEIGHT. MAX PERFORMANCE.",
    description:
      "Diseñado para competitivo: menos peso, más control y una respuesta preparada para sesiones intensas de FPS.",
    image: "/products/mouse-lamzu-maya-x-black/premium/hero.jpg",
    highlights: [
      { label: "47g", text: "Ultraligero" },
      { label: "PAW3950", text: "Sensor flagship" },
      { label: "8K", text: "Polling rate" },
      { label: "80H", text: "Batería aprox." },
    ],
  },

  {
    type: "split",
    title: "SENSOR PIXART PAW3950",
    description:
      "Precisión profesional diseñada para tracking competitivo, movimientos rápidos y control absoluto en escenarios de alta exigencia.",
    image: "/products/mouse-lamzu-maya-x-black/premium/sensor.jpg",
    reverse: false,
  },

  {
    type: "grid",
    items: [
      {
        title: "47 gramos",
        description:
          "Construcción ultraligera pensada para flicks rápidos y menor fatiga.",
        image: "/products/mouse-lamzu-maya-x-black/premium/weight.jpg",
      },
      {
        title: "Hasta 80 horas",
        description:
          "Autonomía optimizada para sesiones largas de gaming competitivo.",
        image: "/products/mouse-lamzu-maya-x-black/premium/battery.jpg",
      },
      {
        title: "8K Polling Rate",
        description:
           "Respuesta inalámbrica de baja latencia para movimientos precisos y competitivos.",
        image: "/products/mouse-lamzu-maya-x-black/premium/wireless.jpg",
      },
      {
        title: "Forma simétrica",
        description:
          "Diseñado para claw, fingertip y movimientos rápidos con control preciso.",
        image: "/products/mouse-lamzu-maya-x-black/premium/shape.jpg",
      },
    ],
  },
],
    
  },
  manufacturerPdfUrl: null,
  seoTitle: "Mouse Lamzu Maya X Wireless Black | RekaByte Chile",
  seoDescription:
    "Mouse Lamzu Maya X Wireless Black en Chile. Mouse gamer premium ultraligero para competitivo, sensor PAW3950, polling 8K y diseño esports.",
},
{
  slug: "teclado-magnetico-attack-shark-x68he-rose-red",
  name: "Teclado magnético Attack Shark X68HE Rose Red",
  title: "Teclado magnético Attack Shark X68HE Rose Red",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "KEYBOARD",
  brand: "Attack Shark",
  sku: "AS-X68HE-ROSE-RED",
  shortDescription:
    "Teclado magnético 60% con Rapid Trigger, switches Hall Effect, polling 8000 Hz, actuación ajustable y RGB.",
  description:
    "El Attack Shark X68HE Rose Red es un teclado magnético compacto orientado a jugadores competitivos que buscan respuesta inmediata, personalización avanzada y una estética llamativa. Sus switches magnéticos permiten ajustar el punto de actuación y usar funciones como Rapid Trigger, Snap Tap y DKS, ideales para FPS competitivos como Valorant, Counter-Strike 2, Apex Legends y osu!.",
  price: 119990,
  priceTransfer: 109990,
  priceCard: 119990,
  imageUrl: "/products/teclado-magnetico-attack-shark-x68he-rose-red/1.jpg",
  images: [
    "/products/teclado-magnetico-attack-shark-x68he-rose-red/1.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-rose-red/2.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-rose-red/3.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-rose-red/4.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-rose-red/5.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-rose-red/6.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-rose-red/7.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-rose-red/8.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-rose-red/9.jpg",
  ],
  stock: 1,
  isActive: true,
  featured: true,
  badge: "Hall Effect",
  sortOrder: 110,
  specs: {
    Modelo: "Attack Shark X68HE",
    Layout: "60% / 66 teclas",
    Switches: "Magnéticos lineales Hall Effect",
    RapidTrigger: "Sí, precisión 0.01 mm",
    Actuacion: "Ajustable de 0.1 mm a 3.4 mm",
    PollingRate: "8000 Hz",
    ScanRate: "128K",
    Conexion: "USB-C cableado",
    RGB: "South-facing RGB 16M colores",
    Keycaps: "PBT double-shot",
    Funciones: "Rapid Trigger, Snap Tap, DKS, Mod-Tap, Toggle Key",
    Compatibilidad: "Windows / macOS",
    Color: "Rose Red",
  },
  manufacturerPdfUrl: null,
  seoTitle: "Teclado Magnético Attack Shark X68HE Rose Red | RekaByte Chile",
  seoDescription:
    "Teclado magnético Attack Shark X68HE Rose Red en Chile. Rapid Trigger, switches Hall Effect, 8000 Hz, actuación ajustable y RGB.",
},
{
  slug: "teclado-magnetico-attack-shark-x68he-black-contour",
  name: "Teclado magnético Attack Shark X68HE Black Contour",
  title: "Teclado magnético Attack Shark X68HE Black Contour",
  kind: "UNIT_PRODUCT",
  category: "PERIPHERAL",
  subcategory: "KEYBOARD",
  brand: "Attack Shark",
  sku: "AS-X68HE-BLACK-CONTOUR",
  shortDescription:
    "Teclado magnético 60% con Rapid Trigger, switches Hall Effect, polling 8000 Hz, actuación ajustable y diseño Black Contour.",
  description:
    "El Attack Shark X68HE Black Contour es un teclado magnético compacto diseñado para velocidad, precisión y control avanzado en juegos competitivos. Su tecnología Hall Effect permite ajustar la actuación de cada tecla, activar Rapid Trigger y aprovechar funciones avanzadas como Snap Tap y DKS. Es una opción potente para quienes buscan una experiencia similar a teclados magnéticos premium, pero en un formato compacto y llamativo.",
  price: 119990,
  priceTransfer: 109990,
  priceCard: 119990,
  imageUrl: "/products/teclado-magnetico-attack-shark-x68he-black-contour/1.jpg",
  images: [
    "/products/teclado-magnetico-attack-shark-x68he-black-contour/1.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-black-contour/2.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-black-contour/3.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-black-contour/4.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-black-contour/5.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-black-contour/6.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-black-contour/7.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-black-contour/8.jpg",
    "/products/teclado-magnetico-attack-shark-x68he-black-contour/9.jpg",
  ],
  stock: 1,
  isActive: true,
  featured: true,
  badge: "Hall Effect",
  sortOrder: 111,
  specs: {
    Modelo: "Attack Shark X68HE",
    Layout: "60% / 66 teclas",
    Switches: "Magnéticos lineales Hall Effect",
    RapidTrigger: "Sí, precisión 0.01 mm",
    Actuacion: "Ajustable de 0.1 mm a 3.4 mm",
    PollingRate: "8000 Hz",
    ScanRate: "128K",
    Conexion: "USB-C cableado",
    RGB: "South-facing RGB 16M colores",
    Keycaps: "PBT double-shot",
    Funciones: "Rapid Trigger, Snap Tap, DKS, Mod-Tap, Toggle Key",
    Compatibilidad: "Windows / macOS",
    Color: "Black Contour",
  },
  manufacturerPdfUrl: null,
  seoTitle: "Teclado Magnético Attack Shark X68HE Black Contour | RekaByte Chile",
  seoDescription:
    "Teclado magnético Attack Shark X68HE Black Contour en Chile. Rapid Trigger, Hall Effect, polling 8000 Hz, actuación ajustable y RGB.",
},
];