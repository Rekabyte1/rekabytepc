"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { useCheckout } from "@/components/CheckoutStore";
import { useCheckoutGuard } from "@/components/useCheckoutGuard";
import { useCart } from "@/components/CartContext";

type TipoEnvioUI = "pickup" | "delivery";
type CourierUI = "bluexpress";
type ShippingZone = "RM" | "NO_EXTREMA" | "EXTREMOS" | "UNKNOWN";
type ComponentShippingSize = "SMALL" | "MEDIUM" | "LARGE" | "XL";

type Option = { value: string; label: string };

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

function zoneByRegion(regionRaw: string): ShippingZone {
  const r = normalizeRegion(regionRaw);
  if (!r) return "UNKNOWN";

  if (r.includes("metropolitana")) return "RM";

  // Zonas extremas para tu lógica comercial
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

function pcShippingPerUnit(zone: ShippingZone, unitSubtotalTransfer: number) {
  if (zone === "EXTREMOS") return 20000;

  if (zone === "RM") {
    return unitSubtotalTransfer > 2_000_000 ? 12000 : 8000;
  }

  return unitSubtotalTransfer > 1_500_000 ? 15000 : 12000;
}

function componentShippingBySize(
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

function sizeRank(size: ComponentShippingSize) {
  switch (size) {
    case "SMALL":
      return 1;
    case "MEDIUM":
      return 2;
    case "LARGE":
      return 3;
    case "XL":
      return 4;
  }
}

function inferCartItemShippingSize(item: {
  id?: string;
  name?: string;
}): ComponentShippingSize {
  const text = `${normalizeText(item.id)} ${normalizeText(item.name)}`;

  if (text.includes("monitor")) return "XL";

  if (text.includes("gabinete") || text.includes("case")) {
    if (
      text.includes("mini itx") ||
      text.includes("mini-itx") ||
      text.includes("micro atx") ||
      text.includes("micro-atx") ||
      text.includes("matx")
    ) {
      return "LARGE";
    }
    return "XL";
  }

  if (
    text.includes("rtx") ||
    text.includes("radeon") ||
    text.includes("rx ") ||
    text.includes("rx-") ||
    text.includes("gpu") ||
    text.includes("tarjeta de video") ||
    text.includes("placa madre") ||
    text.includes("motherboard")
  ) {
    return "LARGE";
  }

  if (
    text.includes("fuente") ||
    text.includes("psu") ||
    text.includes("cooler") ||
    text.includes("disipador") ||
    text.includes("ventilador") ||
    text.includes("teclado") ||
    text.includes("audifono") ||
    text.includes("headset") ||
    text.includes("webcam") ||
    text.includes("microfono") ||
    text.includes("mousepad")
  ) {
    return "MEDIUM";
  }

  if (
    text.includes("mouse") ||
    text.includes("ram") ||
    text.includes("ssd") ||
    text.includes("nvme") ||
    text.includes("pasta termica") ||
    text.includes("cpu") ||
    text.includes("procesador")
  ) {
    return "SMALL";
  }

  return "MEDIUM";
}

function isPcItem(item: { id?: string; name?: string }) {
  const text = `${normalizeText(item.id)} ${normalizeText(item.name)}`;

  return (
    text.includes("oficina-") ||
    text.includes("entrada-") ||
    text.includes("media-") ||
    text.includes("ryzen") ||
    text.includes("8600g") ||
    text.includes("pc ")
  );
}

function calculateShipping(params: {
  region?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    priceTransfer: number;
  }>;
}) {
  const { region, items } = params;
  if (!region) return 0;

  const zone = zoneByRegion(region);

  const pcItems = items.filter((item) => isPcItem(item));
  if (pcItems.length > 0) {
    return pcItems.reduce((acc, item) => {
      const perUnit = pcShippingPerUnit(zone, item.priceTransfer);
      return acc + perUnit * item.quantity;
    }, 0);
  }

  const componentUnits = items.reduce((acc, item) => acc + item.quantity, 0);
  if (componentUnits <= 0) return 0;

  const biggestSize = items.reduce<ComponentShippingSize>((max, item) => {
    const current = inferCartItemShippingSize(item);
    return sizeRank(current) > sizeRank(max) ? current : max;
  }, "SMALL");

  const unitShipping = componentShippingBySize(zone, biggestSize);
  return unitShipping * componentUnits;
}

const REGIONES_COMUNAS: Record<string, string[]> = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  Tarapacá: [
    "Iquique",
    "Alto Hospicio",
    "Pozo Almonte",
    "Camiña",
    "Colchane",
    "Huara",
    "Pica",
  ],
  Antofagasta: [
    "Antofagasta",
    "Mejillones",
    "Sierra Gorda",
    "Taltal",
    "Calama",
    "Ollagüe",
    "San Pedro de Atacama",
    "Tocopilla",
    "María Elena",
  ],
  Atacama: [
    "Copiapó",
    "Caldera",
    "Tierra Amarilla",
    "Chañaral",
    "Diego de Almagro",
    "Vallenar",
    "Freirina",
    "Huasco",
    "Alto del Carmen",
  ],
  Coquimbo: [
    "La Serena",
    "Coquimbo",
    "Andacollo",
    "La Higuera",
    "Paihuano",
    "Vicuña",
    "Illapel",
    "Canela",
    "Los Vilos",
    "Salamanca",
    "Ovalle",
    "Combarbalá",
    "Monte Patria",
    "Punitaqui",
    "Río Hurtado",
  ],
  Valparaíso: [
    "Valparaíso",
    "Casablanca",
    "Concón",
    "Juan Fernández",
    "Puchuncaví",
    "Quintero",
    "Viña del Mar",
    "Isla de Pascua",
    "Los Andes",
    "Calle Larga",
    "Rinconada",
    "San Esteban",
    "La Ligua",
    "Cabildo",
    "Papudo",
    "Petorca",
    "Zapallar",
    "Quillota",
    "Calera",
    "Hijuelas",
    "La Cruz",
    "Nogales",
    "San Antonio",
    "Algarrobo",
    "Cartagena",
    "El Quisco",
    "El Tabo",
    "Santo Domingo",
    "San Felipe",
    "Catemu",
    "Llaillay",
    "Panquehue",
    "Putaendo",
    "Santa María",
    "Quilpué",
    "Limache",
    "Olmué",
    "Villa Alemana",
  ],
  "Región Metropolitana": [
    "Cerrillos",
    "Cerro Navia",
    "Conchalí",
    "El Bosque",
    "Estación Central",
    "Huechuraba",
    "Independencia",
    "La Cisterna",
    "La Florida",
    "La Granja",
    "La Pintana",
    "La Reina",
    "Las Condes",
    "Lo Barnechea",
    "Lo Espejo",
    "Lo Prado",
    "Macul",
    "Maipú",
    "Ñuñoa",
    "Pedro Aguirre Cerda",
    "Peñalolén",
    "Providencia",
    "Pudahuel",
    "Quilicura",
    "Quinta Normal",
    "Recoleta",
    "Renca",
    "San Joaquín",
    "San Miguel",
    "San Ramón",
    "Santiago",
    "Vitacura",
    "Puente Alto",
    "Pirque",
    "San José de Maipo",
    "Colina",
    "Lampa",
    "Tiltil",
    "San Bernardo",
    "Buin",
    "Calera de Tango",
    "Paine",
    "Melipilla",
    "Alhué",
    "Curacaví",
    "María Pinto",
    "San Pedro",
    "Talagante",
    "El Monte",
    "Isla de Maipo",
    "Padre Hurtado",
    "Peñaflor",
  ],
  "O'Higgins": [
    "Rancagua",
    "Codegua",
    "Coinco",
    "Coltauco",
    "Doñihue",
    "Graneros",
    "Las Cabras",
    "Machalí",
    "Malloa",
    "Mostazal",
    "Olivar",
    "Peumo",
    "Pichidegua",
    "Quinta de Tilcoco",
    "Rengo",
    "Requínoa",
    "San Vicente",
    "Pichilemu",
    "La Estrella",
    "Litueche",
    "Marchigüe",
    "Navidad",
    "Paredones",
    "San Fernando",
    "Chépica",
    "Chimbarongo",
    "Lolol",
    "Nancagua",
    "Palmilla",
    "Peralillo",
    "Placilla",
    "Pumanque",
    "Santa Cruz",
  ],
  Maule: [
    "Talca",
    "Constitución",
    "Curepto",
    "Empedrado",
    "Maule",
    "Pelarco",
    "Pencahue",
    "Río Claro",
    "San Clemente",
    "San Rafael",
    "Curicó",
    "Hualañé",
    "Licantén",
    "Molina",
    "Rauco",
    "Romeral",
    "Sagrada Familia",
    "Teno",
    "Vichuquén",
    "Linares",
    "Colbún",
    "Longaví",
    "Parral",
    "Retiro",
    "San Javier",
    "Villa Alegre",
    "Yerbas Buenas",
    "Cauquenes",
    "Chanco",
    "Pelluhue",
  ],
  Ñuble: [
    "Chillán",
    "Bulnes",
    "Chillán Viejo",
    "Cobquecura",
    "Coelemu",
    "Coihueco",
    "El Carmen",
    "Ninhue",
    "Ñiquén",
    "Pemuco",
    "Pinto",
    "Portezuelo",
    "Quillón",
    "Quirihue",
    "Ránquil",
    "San Carlos",
    "San Fabián",
    "San Ignacio",
    "San Nicolás",
    "Treguaco",
    "Yungay",
  ],
  Biobío: [
    "Concepción",
    "Coronel",
    "Chiguayante",
    "Florida",
    "Hualqui",
    "Lota",
    "Penco",
    "San Pedro de la Paz",
    "Santa Juana",
    "Talcahuano",
    "Tomé",
    "Hualpén",
    "Lebu",
    "Arauco",
    "Cañete",
    "Contulmo",
    "Curanilahue",
    "Los Álamos",
    "Tirúa",
    "Los Ángeles",
    "Antuco",
    "Cabrero",
    "Laja",
    "Mulchén",
    "Nacimiento",
    "Negrete",
    "Quilaco",
    "Quilleco",
    "San Rosendo",
    "Santa Bárbara",
    "Tucapel",
    "Yumbel",
    "Alto Biobío",
  ],
  "La Araucanía": [
    "Temuco",
    "Carahue",
    "Cunco",
    "Curarrehue",
    "Freire",
    "Galvarino",
    "Gorbea",
    "Lautaro",
    "Loncoche",
    "Melipeuco",
    "Nueva Imperial",
    "Padre Las Casas",
    "Perquenco",
    "Pitrufquén",
    "Pucón",
    "Saavedra",
    "Teodoro Schmidt",
    "Toltén",
    "Vilcún",
    "Villarrica",
    "Cholchol",
    "Angol",
    "Collipulli",
    "Curacautín",
    "Ercilla",
    "Lonquimay",
    "Los Sauces",
    "Lumaco",
    "Purén",
    "Renaico",
    "Traiguén",
    "Victoria",
  ],
  "Los Ríos": [
    "Valdivia",
    "Corral",
    "Lanco",
    "Los Lagos",
    "Máfil",
    "Mariquina",
    "Paillaco",
    "Panguipulli",
    "La Unión",
    "Futrono",
    "Lago Ranco",
    "Río Bueno",
  ],
  "Los Lagos": [
    "Puerto Montt",
    "Calbuco",
    "Cochamó",
    "Fresia",
    "Frutillar",
    "Los Muermos",
    "Llanquihue",
    "Maullín",
    "Puerto Varas",
    "Castro",
    "Ancud",
    "Chonchi",
    "Curaco de Vélez",
    "Dalcahue",
    "Puqueldón",
    "Queilén",
    "Quellón",
    "Quemchi",
    "Quinchao",
    "Osorno",
    "Puerto Octay",
    "Purranque",
    "Puyehue",
    "Río Negro",
    "San Juan de la Costa",
    "San Pablo",
    "Chaitén",
    "Futaleufú",
    "Hualaihué",
    "Palena",
  ],
  Aysén: [
    "Coyhaique",
    "Lago Verde",
    "Aysén",
    "Cisnes",
    "Guaitecas",
    "Cochrane",
    "O'Higgins",
    "Tortel",
    "Chile Chico",
    "Río Ibáñez",
  ],
  Magallanes: [
    "Punta Arenas",
    "Laguna Blanca",
    "Río Verde",
    "San Gregorio",
    "Cabo de Hornos",
    "Antártica",
    "Porvenir",
    "Primavera",
    "Timaukel",
    "Natales",
    "Torres del Paine",
  ],
};

function uniqueSorted(arr: string[]) {
  const set = new Set(arr.map((x) => safeStr(x)).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

function toOptions(list: string[]): Option[] {
  return list.map((x) => ({ value: x, label: x }));
}

function SearchSelect(props: {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  options: Option[];
  disabled?: boolean;
  required?: boolean;
  onChange: (next: string) => void;
}) {
  const { name, label, placeholder, value, options, disabled, required, onChange } =
    props;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastKeyRef = useRef<{ key: string; t: number; idx: number }>({
    key: "",
    t: 0,
    idx: 0,
  });

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return options;
    return options.filter((o) => normalizeText(o.label).includes(q));
  }, [options, query]);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label ?? "";
  }, [options, value]);

  useEffect(() => {
    if (!open) return;
    setActiveIdx(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function commitValue(v: string) {
    onChange(v);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;

    if (!open && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }

    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIdx];
      if (opt) commitValue(opt.value);
      return;
    }

    const isLetter = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ]$/.test(e.key);
    if (isLetter) {
      const now = Date.now();
      const k = normalizeText(e.key);
      const prev = lastKeyRef.current;
      const within = now - prev.t < 900 && prev.key === k;

      const candidates = filtered
        .map((o, idx) => ({ o, idx }))
        .filter(({ o }) => normalizeText(o.label).startsWith(k));

      if (candidates.length) {
        e.preventDefault();
        const nextIdx = within ? (prev.idx + 1) % candidates.length : 0;
        lastKeyRef.current = { key: k, t: now, idx: nextIdx };
        setActiveIdx(candidates[nextIdx].idx);
      }
    }
  }

  return (
    <div className="ss-wrap" ref={wrapRef}>
      <label className="cs-label">
        {label}
        {required ? " *" : ""}
      </label>

      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        className={`ss-btn ${disabled ? "is-disabled" : ""}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={`ss-value ${selectedLabel ? "" : "is-placeholder"}`}>
          {selectedLabel || placeholder}
        </span>
        <span className="ss-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div className="ss-pop" role="listbox" tabIndex={-1} onKeyDown={handleKeyDown}>
          <div className="ss-search">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="ss-input"
            />
          </div>

          <div className="ss-list">
            {filtered.length === 0 ? (
              <div className="ss-empty">Sin resultados</div>
            ) : (
              filtered.map((opt, idx) => {
                const active = idx === activeIdx;
                const selected = opt.value === value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    className={`ss-item ${active ? "is-active" : ""} ${
                      selected ? "is-selected" : ""
                    }`}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => commitValue(opt.value)}
                  >
                    {opt.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .ss-wrap {
          position: relative;
        }

        .ss-btn {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          background: #141414;
          border: 1px solid #242424;
          color: #e5e7eb;
          padding: 0 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          cursor: pointer;
        }

        .ss-btn:hover {
          border-color: #343434;
        }

        .ss-btn.is-disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ss-value {
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          color: #e5e7eb;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ss-value.is-placeholder {
          color: #6b7280;
          font-weight: 600;
        }

        .ss-caret {
          color: #9ca3af;
          font-size: 14px;
        }

        .ss-pop {
          position: absolute;
          z-index: 40;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #0d0d0d;
          border: 1px solid #262626;
          border-radius: 14px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.55);
          overflow: hidden;
        }

        .ss-search {
          padding: 10px;
          border-bottom: 1px solid #262626;
          background: rgba(20, 20, 20, 0.45);
        }

        .ss-input {
          width: 100%;
          height: 40px;
          border-radius: 12px;
          background: #141414;
          border: 1px solid #242424;
          color: #e5e7eb;
          padding: 0 12px;
          outline: none;
        }

        .ss-input:focus {
          border-color: rgba(182, 255, 46, 0.6);
          box-shadow: 0 0 0 1px rgba(182, 255, 46, 0.15) inset;
        }

        .ss-list {
          max-height: 260px;
          overflow: auto;
          padding: 6px;
        }

        .ss-item {
          width: 100%;
          text-align: left;
          border: 1px solid transparent;
          background: transparent;
          color: #e5e7eb;
          padding: 10px 10px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
        }

        .ss-item:hover,
        .ss-item.is-active {
          background: rgba(182, 255, 46, 0.1);
          border-color: rgba(182, 255, 46, 0.18);
        }

        .ss-item.is-selected {
          background: rgba(182, 255, 46, 0.16);
          border-color: rgba(182, 255, 46, 0.28);
        }

        .ss-empty {
          padding: 14px 10px;
          color: #a3a3a3;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}

export default function Paso2Envio() {
  useCheckoutGuard(2);

  const router = useRouter();
  const { envio, setEnvio } = useCheckout();
  const { items } = useCart();

  const initialTipo = useMemo<TipoEnvioUI>(() => {
    if (!envio) return "pickup";
    return (envio as any).tipo === "delivery" ? "delivery" : "pickup";
  }, [envio]);

  const [tipo, setTipo] = useState<TipoEnvioUI>(initialTipo);
  const [direccion, setDireccion] = useState<string>(safeStr((envio as any)?.direccion));
  const [region, setRegion] = useState<string>(safeStr((envio as any)?.region));
  const [comuna, setComuna] = useState<string>(safeStr((envio as any)?.comuna));
  const [ciudad, setCiudad] = useState<string>(safeStr((envio as any)?.ciudad));

  const courier: CourierUI = "bluexpress";

  const regionesOptions = useMemo<Option[]>(() => {
    return toOptions(uniqueSorted(Object.keys(REGIONES_COMUNAS)));
  }, []);

  const comunasOptions = useMemo<Option[]>(() => {
    const list = region ? REGIONES_COMUNAS[region] ?? [] : [];
    return toOptions(uniqueSorted(list));
  }, [region]);

  const ciudadesOptions = useMemo<Option[]>(() => {
    const list = region ? REGIONES_COMUNAS[region] ?? [] : [];
    return toOptions(uniqueSorted(list));
  }, [region]);

  useEffect(() => {
    if (!region) {
      if (comuna) setComuna("");
      if (ciudad) setCiudad("");
      return;
    }

    const allowed = new Set((REGIONES_COMUNAS[region] ?? []).map((x) => safeStr(x)));
    if (comuna && !allowed.has(comuna)) setComuna("");
    if (ciudad && !allowed.has(ciudad)) setCiudad("");
  }, [region]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!comuna) return;
    if (!ciudad) setCiudad(comuna);
  }, [comuna]); // eslint-disable-line react-hooks/exhaustive-deps

  const estimatedShipping = useMemo(() => {
    if (tipo !== "delivery") return 0;

    return calculateShipping({
      region,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        priceTransfer: item.priceTransfer,
      })),
    });
  }, [tipo, region, items]);

  const canContinueDelivery = useMemo(() => {
    if (tipo !== "delivery") return true;
    return Boolean(
      safeStr(direccion) && safeStr(region) && safeStr(comuna) && safeStr(ciudad)
    );
  }, [tipo, direccion, region, comuna, ciudad]);

  return (
    <main className="rb-container checkout-step">
      <h1 className="cs-title">Forma de entrega</h1>

      <div className="cs-steps">
        <CheckoutSteps active={1} />
      </div>

      <div className="cs-grid">
        <section className="cs-card">
          <div className="cs-head">
            <div className="cs-accent" />
            <div>
              <h2 className="cs-card-title">Paso 2: Entrega o retiro</h2>
              <p className="cs-card-sub">
                Elige retiro en tienda sin costo o despacho a domicilio.
              </p>
            </div>
          </div>

          <form
            className="cs-form"
            onSubmit={(e) => {
              e.preventDefault();

              if (tipo === "pickup") {
                setEnvio({ tipo: "pickup", costoEnvio: 0 });
                router.push("/checkout/pago");
                return;
              }

              if (!canContinueDelivery) return;

              setEnvio({
                tipo: "delivery",
                costoEnvio: estimatedShipping,
                courier,
                direccion: safeStr(direccion),
                region: safeStr(region),
                comuna: safeStr(comuna),
                ciudad: safeStr(ciudad),
              } as any);

              router.push("/checkout/pago");
            }}
          >
            <div className="cs-choice-grid">
              <label className={`cs-choice ${tipo === "pickup" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="tipo"
                  value="pickup"
                  checked={tipo === "pickup"}
                  onChange={() => setTipo("pickup")}
                />
                <div className="cs-choice-body">
                  <div className="cs-choice-title">Punto de retiro (gratis)</div>
                  <div className="cs-choice-sub">A pasos de metro Lo Vial, San Miguel</div>
                </div>
                <div className="cs-pill">Gratis</div>
              </label>

              <label className={`cs-choice ${tipo === "delivery" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="tipo"
                  value="delivery"
                  checked={tipo === "delivery"}
                  onChange={() => setTipo("delivery")}
                />
                <div className="cs-choice-body">
                  <div className="cs-choice-title">Despacho a domicilio</div>
                  <div className="cs-choice-sub">
                    Envío por Bluexpress con tarifa según tipo de producto y zona.
                  </div>
                </div>
                <div className="cs-pill cs-pill--muted">Envío</div>
              </label>
            </div>

            <div className={`cs-block ${tipo === "delivery" ? "" : "is-hidden"}`}>
              <div className="cs-block-title">Dirección de entrega</div>

              <div className="cs-two">
                <div className="cs-field">
                  <label className="cs-label">Calle y número *</label>
                  <input
                    name="direccion"
                    className="cs-input"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej: Providencia 432"
                    disabled={tipo !== "delivery"}
                  />
                </div>

                <div className="cs-field">
                  <SearchSelect
                    name="region"
                    label="Región"
                    placeholder="Seleccionar región"
                    value={region}
                    options={regionesOptions}
                    disabled={tipo !== "delivery"}
                    required
                    onChange={(v) => {
                      setRegion(v);
                    }}
                  />
                </div>
              </div>

              <div className="cs-two">
                <div className="cs-field">
                  <SearchSelect
                    name="ciudad"
                    label="Ciudad"
                    placeholder={region ? "Seleccionar ciudad" : "Selecciona región primero"}
                    value={ciudad}
                    options={ciudadesOptions}
                    disabled={tipo !== "delivery" || !region}
                    required
                    onChange={(v) => {
                      setCiudad(v);
                      if (!comuna) setComuna(v);
                    }}
                  />
                </div>

                <div className="cs-field">
                  <SearchSelect
                    name="comuna"
                    label="Comuna"
                    placeholder={region ? "Seleccionar comuna" : "Selecciona región primero"}
                    value={comuna}
                    options={comunasOptions}
                    disabled={tipo !== "delivery" || !region}
                    required
                    onChange={(v) => {
                      setComuna(v);
                      if (!ciudad) setCiudad(v);
                    }}
                  />
                </div>
              </div>

              <div className="cs-two">
                <div className="cs-field">
                  <label className="cs-label">Courier</label>
                  <select name="courier" value="bluexpress" className="cs-select" disabled>
                    <option value="bluexpress">Bluexpress</option>
                  </select>
                </div>

                <div className="cs-field">
                  <label className="cs-label">Costo estimado</label>
                  <input
                    className="cs-input"
                    value={
                      tipo === "delivery"
                        ? new Intl.NumberFormat("es-CL", {
                            style: "currency",
                            currency: "CLP",
                          }).format(estimatedShipping)
                        : "$0"
                    }
                    disabled
                    readOnly
                  />
                </div>
              </div>

              {!canContinueDelivery && tipo === "delivery" ? (
                <p className="cs-warn">
                  Completa dirección, región, ciudad y comuna para continuar.
                </p>
              ) : null}

              <p className="cs-help">
                Bluexpress se calcula según zona y tipo real de producto. El backend
                siempre valida el monto final antes de crear el pedido.
              </p>
            </div>

            <div className="cs-actions">
              <button
                type="button"
                onClick={() => router.back()}
                className="rb-btn rb-btn--ghost"
              >
                Volver
              </button>

              <button
                type="submit"
                className="rb-btn"
                disabled={tipo === "delivery" && !canContinueDelivery}
                aria-disabled={tipo === "delivery" && !canContinueDelivery}
              >
                Continuar
              </button>
            </div>
          </form>
        </section>

        <aside className="cs-summary">
          <CheckoutSummary />
        </aside>
      </div>

      <style jsx>{`
        .checkout-step {
          padding-top: 24px;
          padding-bottom: 24px;
        }

        .cs-title {
          margin: 0 0 10px;
          font-size: 30px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .cs-steps {
          margin-bottom: 14px;
        }

        .cs-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          align-items: start;
        }

        @media (min-width: 1024px) {
          .cs-grid {
            grid-template-columns: 1fr 420px;
            gap: 22px;
          }
        }

        .cs-card {
          background: #0d0d0d;
          border: 1px solid #262626;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
        }

        .cs-head {
          display: grid;
          grid-template-columns: 10px 1fr;
          gap: 12px;
          align-items: start;
          margin-bottom: 14px;
        }

        .cs-accent {
          width: 4px;
          height: 24px;
          border-radius: 999px;
          background: #b6ff2e;
          margin-top: 2px;
        }

        .cs-card-title {
          margin: 0;
          color: #fff;
          font-size: 18px;
          font-weight: 800;
        }

        .cs-card-sub {
          margin: 6px 0 0;
          color: #a3a3a3;
          font-size: 14px;
          line-height: 1.5;
        }

        .cs-form {
          display: grid;
          gap: 14px;
        }

        .cs-choice-grid {
          display: grid;
          gap: 10px;
        }

        .cs-choice {
          display: grid;
          grid-template-columns: 18px 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 12px;
          border-radius: 14px;
          background: rgba(20, 20, 20, 0.55);
          border: 1px solid #262626;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .cs-choice:hover {
          border-color: #3a3a3a;
          background: rgba(20, 20, 20, 0.7);
        }

        .cs-choice.is-selected {
          border-color: rgba(182, 255, 46, 0.6);
          box-shadow: 0 0 0 1px rgba(182, 255, 46, 0.15) inset;
        }

        .cs-choice input[type="radio"] {
          accent-color: #b6ff2e;
        }

        .cs-choice-title {
          color: #fff;
          font-weight: 800;
          font-size: 14px;
        }

        .cs-choice-sub {
          margin-top: 2px;
          color: #a3a3a3;
          font-size: 13px;
        }

        .cs-pill {
          border: 1px solid #2a2a2a;
          background: rgba(20, 20, 20, 0.6);
          color: #b6ff2e;
          font-weight: 800;
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .cs-pill--muted {
          color: #e5e7eb;
          opacity: 0.9;
        }

        .cs-block {
          border: 1px solid #262626;
          background: rgba(20, 20, 20, 0.35);
          border-radius: 14px;
          padding: 12px;
          transition: opacity 0.15s ease;
        }

        .cs-block.is-hidden {
          opacity: 0.4;
          pointer-events: none;
          filter: grayscale(0.2);
        }

        .cs-block-title {
          color: #e5e7eb;
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .cs-two {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 768px) {
          .cs-two {
            grid-template-columns: 1fr 1fr;
          }
        }

        .cs-field {
          display: grid;
          gap: 6px;
        }

        .cs-label {
          color: #d4d4d4;
          font-size: 13px;
          font-weight: 700;
        }

        .cs-input,
        .cs-select {
          width: 100%;
          background: #141414;
          border: 1px solid #242424;
          color: #e5e7eb;
          border-radius: 12px;
          height: 44px;
          padding: 0 12px;
        }

        .cs-select {
          padding-right: 10px;
        }

        .cs-input::placeholder {
          color: #6b7280;
        }

        .cs-help {
          margin: 10px 0 0;
          color: #737373;
          font-size: 12px;
          line-height: 1.45;
        }

        .cs-warn {
          margin: 10px 0 0;
          color: #fca5a5;
          font-size: 12px;
          font-weight: 800;
        }

        .cs-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 6px;
          flex-wrap: wrap;
        }

        .cs-actions .rb-btn {
          min-width: 160px;
        }

        .cs-summary {
          position: sticky;
          top: 1.5rem;
        }

        :global(.checkout-step input),
        :global(.checkout-step select) {
          appearance: none;
          -webkit-appearance: none;
        }

        :global(.checkout-step select) {
          appearance: auto;
          -webkit-appearance: auto;
        }
      `}</style>
    </main>
  );
}