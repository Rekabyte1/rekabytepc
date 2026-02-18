// app/checkout/envio/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { calcularEnvio, useCheckout } from "@/components/CheckoutStore";
import { useCheckoutGuard } from "@/components/useCheckoutGuard";

type TipoEnvioUI = "pickup" | "delivery";
type CourierUI = "chilexpress";

type Option = { value: string; label: string };

function safeStr(v: unknown) {
  return String(v ?? "").trim();
}

/* ============================================================
   DATA: Regiones + Comunas (Chile)
   - Ciudad la derivamos desde la comuna (práctico para ecommerce)
   - Si más adelante quieres "ciudad real", lo conectamos a una fuente externa
   ============================================================ */

const REGIONES_COMUNAS: Record<string, string[]> = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  Tarapacá: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
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
  Atacama: ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Freirina", "Huasco", "Alto del Carmen"],
  Coquimbo: ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paihuano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
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
  Ñuble: ["Chillán", "Bulnes", "Chillán Viejo", "Cobquecura", "Coelemu", "Coihueco", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"],
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
  "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
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
  Aysén: ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
  Magallanes: ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"],
};

function normalizeKey(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function uniqueSorted(arr: string[]) {
  const set = new Set(arr.map((x) => safeStr(x)).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

function toOptions(list: string[]): Option[] {
  return list.map((x) => ({ value: x, label: x }));
}

/* ============================================================
   SearchSelect (sin libs)
   - filtro por input
   - teclado: ↑ ↓ Enter Esc
   - "type to cycle": presionar letras cicla resultados por prefijo
   ============================================================ */

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
  const { name, label, placeholder, value, options, disabled, required, onChange } = props;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // type-to-cycle
  const lastKeyRef = useRef<{ key: string; t: number; idx: number }>({ key: "", t: 0, idx: 0 });

  const filtered = useMemo(() => {
    const q = normalizeKey(query);
    if (!q) return options;
    return options.filter((o) => normalizeKey(o.label).includes(q));
  }, [options, query]);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label ?? "";
  }, [options, value]);

  useEffect(() => {
    if (!open) return;
    setActiveIdx(0);
    // focus input del filtro al abrir
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

    // Abrir con Enter/Espacio desde el botón
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

    // type-to-cycle: si el foco está en el wrapper/lista (o incluso en input vacío),
    // y presiona una letra, ciclamos por prefijo
    const isLetter = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ]$/.test(e.key);
    if (isLetter) {
      const now = Date.now();
      const k = normalizeKey(e.key);
      const prev = lastKeyRef.current;
      const within = now - prev.t < 900 && prev.key === k;

      const candidates = filtered
        .map((o, idx) => ({ o, idx }))
        .filter(({ o }) => normalizeKey(o.label).startsWith(k));

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
      <label className="cs-label">{label}{required ? " *" : ""}</label>

      {/* Hidden input para que FormData lo tome */}
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
        <span className="ss-caret" aria-hidden="true">▾</span>
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
                    className={`ss-item ${active ? "is-active" : ""} ${selected ? "is-selected" : ""}`}
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
          background: rgba(182, 255, 46, 0.10);
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

  const initialTipo = useMemo<TipoEnvioUI>(() => {
    if (!envio) return "pickup";
    return (envio as any).tipo === "delivery" ? "delivery" : "pickup";
  }, [envio]);

  const [tipo, setTipo] = useState<TipoEnvioUI>(initialTipo);

  // Campos controlados (para selects)
  const [direccion, setDireccion] = useState<string>(safeStr((envio as any)?.direccion));
  const [region, setRegion] = useState<string>(safeStr((envio as any)?.region));
  const [comuna, setComuna] = useState<string>(safeStr((envio as any)?.comuna));
  const [ciudad, setCiudad] = useState<string>(safeStr((envio as any)?.ciudad));

  // courier fijo
  const courier: CourierUI = "chilexpress";

  const regionesOptions = useMemo<Option[]>(() => {
    return toOptions(uniqueSorted(Object.keys(REGIONES_COMUNAS)));
  }, []);

  const comunasOptions = useMemo<Option[]>(() => {
    const list = region ? REGIONES_COMUNAS[region] ?? [] : [];
    return toOptions(uniqueSorted(list));
  }, [region]);

  // Ciudad: por ahora lo hacemos equivalente a Comuna (práctico y consistente),
  // pero se mantiene como select separado como pediste.
  const ciudadesOptions = useMemo<Option[]>(() => {
    // Si hay región, usamos comunas de esa región como "ciudades" disponibles
    // (en Chile, para despacho normalmente basta comuna).
    const list = region ? REGIONES_COMUNAS[region] ?? [] : [];
    return toOptions(uniqueSorted(list));
  }, [region]);

  // Cascada: si cambias región, limpiamos ciudad/comuna si ya no aplican
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

  // Si cambias comuna y ciudad está vacía (o quedó fuera), sincronizamos ciudad=comuna
  useEffect(() => {
    if (!comuna) return;
    if (!ciudad) setCiudad(comuna);
  }, [comuna]); // eslint-disable-line react-hooks/exhaustive-deps

  const canContinueDelivery = useMemo(() => {
    if (tipo !== "delivery") return true;
    // requisitos mínimos
    return Boolean(safeStr(direccion) && safeStr(region) && safeStr(comuna) && safeStr(ciudad));
  }, [tipo, direccion, region, comuna, ciudad]);

  return (
    <main className="rb-container checkout-step">
      <h1 className="cs-title">Forma de entrega</h1>

      <div className="cs-steps">
        <CheckoutSteps active={1} />
      </div>

      <div className="cs-grid">
        {/* IZQUIERDA */}
        <section className="cs-card">
          <div className="cs-head">
            <div className="cs-accent" />
            <div>
              <h2 className="cs-card-title">Paso 2: Entrega o retiro</h2>
              <p className="cs-card-sub">Elige retiro en tienda sin costo o despacho a domicilio.</p>
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

              // delivery
              if (!canContinueDelivery) return;

              const costo = calcularEnvio(courier);

              setEnvio({
                tipo: "delivery",
                costoEnvio: costo,
                courier,
                direccion: safeStr(direccion),
                region: safeStr(region),
                comuna: safeStr(comuna),
                // guardamos ciudad también, aunque tu store no lo tipa hoy
                ciudad: safeStr(ciudad),
              } as any);

              router.push("/checkout/pago");
            }}
          >
            {/* Opciones */}
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
                  <div className="cs-choice-sub">A pasos de metro Lo vial, San Miguel</div>
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
                  <div className="cs-choice-sub">Costo calculado según courier.</div>
                </div>
                <div className="cs-pill cs-pill--muted">Envío</div>
              </label>
            </div>

            {/* Dirección (solo si tipo=delivery) */}
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
                    placeholder="Ej: Los Copihues 571"
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
                      // si la comuna está vacía, ayuda a completar
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
                      // sincroniza ciudad si no está definida o quedó distinta
                      if (!ciudad) setCiudad(v);
                    }}
                  />
                </div>
              </div>

              <div className="cs-two">
                <div className="cs-field">
                  <label className="cs-label">Courier</label>
                  <select name="courier" value="chilexpress" className="cs-select" disabled>
                    <option value="chilexpress">Chilexpress</option>
                  </select>
                </div>

                <div className="cs-field">
                  <label className="cs-label">Costo estimado</label>
                  <input
                    className="cs-input"
                    value={
                      tipo === "delivery"
                        ? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(
                            calcularEnvio(courier)
                          )
                        : "$0"
                    }
                    disabled
                    readOnly
                  />
                </div>
              </div>

              {!canContinueDelivery && tipo === "delivery" ? (
                <p className="cs-warn">Completa dirección, región, ciudad y comuna para continuar.</p>
              ) : null}

              <p className="cs-help">
                Selecciona región y luego ciudad/comuna con búsqueda rápida. También puedes navegar por letra: al presionar
                una letra repetidas veces, se recorre entre las coincidencias.
              </p>
            </div>

            <div className="cs-actions">
              <button type="button" onClick={() => router.back()} className="rb-btn rb-btn--ghost">
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

        {/* DERECHA */}
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
