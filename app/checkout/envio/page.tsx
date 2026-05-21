"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutSummary from "@/components/CheckoutSummary";
import { useCheckout } from "@/components/CheckoutStore";
import { useCheckoutGuard } from "@/components/useCheckoutGuard";
import { useCart } from "@/components/CartContext";
import { calculateShippingCost } from "@/lib/shipping";

type TipoEnvioUI = "pickup" | "delivery";
type CourierUI = "bluexpress";
type Option = { value: string; label: string };

function safeStr(v: unknown) {
  return String(v ?? "").trim();
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
    "Viña del Mar",
    "Concón",
    "Quilpué",
    "Villa Alemana",
    "Casablanca",
    "Quintero",
    "Puchuncaví",
    "Juan Fernández",
    "San Antonio",
    "Cartagena",
    "El Tabo",
    "El Quisco",
    "Algarrobo",
    "Santo Domingo",
    "Isla de Pascua",
    "Los Andes",
    "Calle Larga",
    "Rinconada",
    "San Esteban",
    "San Felipe",
    "Catemu",
    "Llaillay",
    "Panquehue",
    "Putaendo",
    "Santa María",
    "Quillota",
    "Calera",
    "Hijuelas",
    "La Cruz",
    "Nogales",
    "Petorca",
    "Cabildo",
    "La Ligua",
    "Papudo",
    "Zapallar",
    "Limache",
    "Olmué",
  ],
  Metropolitana: [
    "Santiago",
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
    "Marchihue",
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
    "Cauquenes",
    "Chanco",
    "Pelluhue",
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
  ],
  Ñuble: [
    "Chillán",
    "Bulnes",
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
    "Chillán Viejo",
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
  Araucanía: [
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
    "O’Higgins",
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
  return [...new Set(arr.map((x) => safeStr(x)).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

function toOptions(arr: string[]): Option[] {
  return arr.map((x) => ({ value: x, label: x }));
}

function SearchSelect({
  value,
  options,
  onChange,
  placeholder,
  label,
  disabled,
  required,
  name,
}: {
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [query, options]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    setActive(0);
  }, [query, open]);

  const selectedLabel = value
    ? options.find((o) => o.value === value)?.label ?? value
    : "";

  return (
    <div className="ss-wrap" ref={boxRef}>
      <label className="cs-label">{label}{required ? " *" : ""}</label>
      <button
        type="button"
        className={`cs-input ss-trigger ${disabled ? "is-disabled" : ""}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        name={name}
      >
        <span className={selectedLabel ? "ss-value" : "ss-placeholder"}>
          {selectedLabel || placeholder}
        </span>
        <span className="ss-caret">▾</span>
      </button>

      {open && !disabled && (
        <div className="ss-pop">
          <input
            className="ss-search"
            placeholder="Escribe para buscar…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, Math.max(filtered.length - 1, 0)));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const opt = filtered[active];
                if (opt) {
                  onChange(opt.value);
                  setOpen(false);
                  setQuery("");
                }
              } else if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
              }
            }}
            autoFocus
          />

          <div className="ss-list" role="listbox">
            {filtered.length === 0 ? (
              <div className="ss-empty">Sin resultados</div>
            ) : (
              filtered.map((opt, i) => {
                const isSelected = opt.value === value;
                const isActive = i === active;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`ss-item ${isSelected ? "is-selected" : ""} ${isActive ? "is-active" : ""}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {opt.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .ss-wrap {
          position: relative;
        }

        .ss-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          text-align: left;
        }

        .ss-trigger.is-disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .ss-placeholder {
          color: #737373;
        }

        .ss-value {
          color: #f5f5f5;
        }

        .ss-caret {
          color: #a3a3a3;
          font-size: 12px;
        }

        .ss-pop {
          position: absolute;
          z-index: 50;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          background: #0f0f0f;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.45);
          overflow: hidden;
        }

        .ss-search {
          width: 100%;
          border: 0;
          border-bottom: 1px solid #232323;
          background: #111;
          color: #f5f5f5;
          padding: 10px 12px;
          font-size: 13px;
          outline: none;
        }

        .ss-list {
          max-height: 230px;
          overflow: auto;
          display: grid;
        }

        .ss-item {
          border: 0;
          border-bottom: 1px solid #1f1f1f;
          background: transparent;
          color: #e5e7eb;
          text-align: left;
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

    return calculateShippingCost({
      deliveryType: "shipping",
      region,
      items: items.map((item) => ({
        quantity: item.quantity,
        kind: item.kind,
        name: item.name,
        slug: item.slug || item.id,
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
                    onChange={setCiudad}
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
                    onChange={setComuna}
                  />
                </div>
              </div>

              <div className="cs-estimate">
                <span>Estimado de envío</span>
                <strong>
                  {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                    maximumFractionDigits: 0,
                  }).format(estimatedShipping)}
                </strong>
              </div>
            </div>

            <div className="cs-actions">
              <button
                type="button"
                className="rb-btn rb-btn--ghost"
                onClick={() => router.push("/checkout")}
              >
                Volver
              </button>

              <button
                type="submit"
                className="rb-btn"
                disabled={!canContinueDelivery}
              >
                Continuar a pago
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

        .cs-summary {
          position: sticky;
          top: 1.5rem;
        }

        .cs-form {
          display: grid;
          gap: 14px;
        }

        .cs-choice-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 768px) {
          .cs-choice-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .cs-choice {
          border: 1px solid #2a2a2a;
          background: rgba(20, 20, 20, 0.35);
          border-radius: 14px;
          padding: 12px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .cs-choice input {
          margin-top: 2px;
          accent-color: #b6ff2e;
        }

        .cs-choice.is-selected {
          border-color: rgba(182, 255, 46, 0.35);
          background: rgba(182, 255, 46, 0.06);
        }

        .cs-choice-title {
          color: #f5f5f5;
          font-size: 14px;
          font-weight: 900;
        }
        .cs-choice-sub {
          margin-top: 4px;
          color: #a3a3a3;
          font-size: 12px;
          line-height: 1.45;
        }

        .cs-pill {
          border: 1px solid rgba(182, 255, 46, 0.4);
          color: #b6ff2e;
          background: rgba(182, 255, 46, 0.08);
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          padding: 4px 9px;
          white-space: nowrap;
        }

        .cs-pill--muted {
          border-color: rgba(255, 255, 255, 0.14);
          color: #d4d4d4;
          background: rgba(255, 255, 255, 0.04);
        }

        .cs-block {
          border: 1px solid #2a2a2a;
          background: rgba(20, 20, 20, 0.35);
          border-radius: 14px;
          padding: 12px;
          display: grid;
          gap: 10px;
        }

        .cs-block.is-hidden {
          display: none;
        }

        .cs-block-title {
          color: #f5f5f5;
          font-size: 14px;
          font-weight: 900;
          margin-bottom: 2px;
        }

        .cs-two {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        @media (min-width: 900px) {
          .cs-two {
            grid-template-columns: 1fr 1fr;
          }
        }

        .cs-field {
          min-width: 0;
        }

        .cs-label {
          display: block;
          color: #d4d4d4;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .cs-input {
          width: 100%;
          border: 1px solid #2a2a2a;
          background: #121212;
          color: #f5f5f5;
          border-radius: 12px;
          padding: 10px 12px;
          outline: none;
          font-size: 13px;
        }

        .cs-input:focus {
          border-color: rgba(182, 255, 46, 0.35);
          box-shadow: 0 0 0 3px rgba(182, 255, 46, 0.08);
        }

        .cs-input:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .cs-estimate {
          margin-top: 4px;
          border: 1px dashed rgba(182, 255, 46, 0.25);
          background: rgba(182, 255, 46, 0.05);
          border-radius: 12px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: #e5e7eb;
          font-size: 13px;
          font-weight: 800;
        }

        .cs-estimate strong {
          color: #b6ff2e;
          font-size: 14px;
          white-space: nowrap;
        }

        .cs-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 2px;
        }

        .cs-actions :global(.rb-btn) {
          min-width: 160px;
        }
      `}</style>
    </main>
  );
}