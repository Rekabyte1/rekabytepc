"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import {
  FaShoppingBag,
  FaUser,
  FaMapMarkerAlt,
  FaFileInvoice,
  FaKey,
} from "react-icons/fa";

type TabKey = "compras" | "datos" | "direcciones" | "facturacion" | "password";

type Props = {
  tab: string;
  userEmail: string;
};

type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

type PaymentMethod = "CARD" | "TRANSFER";
type ShippingMethod = "DELIVERY" | "PICKUP";

type OrderItem = {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
};

type Shipment = {
  status: "PENDING" | "READY" | "ON_ROUTE" | "DELIVERED";
  trackingCode: string | null;
  pickupLocation: string | null;
};

type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  subtotal: number;
  shippingCost: number;
  total: number;
  notes: string | null;
  items: OrderItem[];
  shipment: Shipment | null;
};

type Profile = {
  name: string;
  lastName: string;
  phone: string;
  rut: string;
  email: string;
};

export default function CuentaPanelClient({ tab, userEmail }: Props) {
  const active: TabKey = useMemo(() => {
    const t = (tab || "").toLowerCase();
    if (t === "compras") return "compras";
    if (t === "datos" || t === "datos-personales") return "datos";
    if (t === "direcciones") return "direcciones";
    if (t === "facturacion" || t === "datos-de-facturacion") return "facturacion";
    if (t === "password" || t === "contrasena" || t === "contraseña") return "password";
    return "compras";
  }, [tab]);

  const items: Array<{
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    href: string;
  }> = [
    {
      key: "compras",
      label: "Compras",
      icon: <FaShoppingBag className="text-neutral-300" />,
      href: "/cuenta/panel?tab=compras",
    },
    {
      key: "datos",
      label: "Datos personales",
      icon: <FaUser className="text-neutral-300" />,
      href: "/cuenta/panel?tab=datos",
    },
    {
      key: "direcciones",
      label: "Direcciones",
      icon: <FaMapMarkerAlt className="text-neutral-300" />,
      href: "/cuenta/panel?tab=direcciones",
    },
    {
      key: "facturacion",
      label: "Datos de facturación",
      icon: <FaFileInvoice className="text-neutral-300" />,
      href: "/cuenta/panel?tab=facturacion",
    },
    {
      key: "password",
      label: "Contraseña",
      icon: <FaKey className="text-neutral-300" />,
      href: "/cuenta/panel?tab=password",
    },
  ];

  // ====== Compras: traer pedidos del usuario ======
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersErr, setOrdersErr] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (active !== "compras") return;

      setOrdersErr(null);
      setOrdersLoading(true);

      try {
        const res = await fetch("/api/account/orders", { cache: "no-store" });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok) {
          const msg = data?.error || `Error al cargar pedidos (HTTP ${res.status}).`;
          throw new Error(msg);
        }

        if (!isMounted) return;
        setOrders(Array.isArray(data?.orders) ? data.orders : []);
      } catch (e: any) {
        if (!isMounted) return;
        setOrdersErr(e?.message || "Error al cargar pedidos.");
        setOrders([]);
      } finally {
        if (!isMounted) return;
        setOrdersLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [active]);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Breadcrumb + logout */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-neutral-400">
          <Link href="/" className="hover:text-lime-300 text-neutral-300">
            Inicio
          </Link>
          <span className="mx-2 text-neutral-600">/</span>
          <span className="text-neutral-200">Mi cuenta</span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/cuenta" })}
          className="rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm font-bold text-neutral-200 hover:bg-black/35"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Mi cuenta
        </h1>
        <p className="mt-2 text-sm text-neutral-400">{userEmail}</p>
      </div>

      {/* Layout */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-2xl border border-neutral-800 bg-neutral-950/55 shadow-[0_18px_55px_rgba(0,0,0,.55)] overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800">
            <p className="text-xs font-extrabold tracking-[.16em] text-lime-300/90">
              MI CUENTA
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              Gestiona tus datos y revisa tu historial.
            </p>
          </div>

          <nav className="p-2">
            {items.map((it) => {
              const isActive = it.key === active;
              return (
                <Link
                  key={it.key}
                  href={it.href}
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-3 transition border",
                    isActive
                      ? "border-lime-400/35 bg-lime-400/10 text-white"
                      : "border-transparent hover:border-neutral-800 hover:bg-black/20 text-neutral-200",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex h-9 w-9 items-center justify-center rounded-xl border",
                      isActive
                        ? "border-lime-400/30 bg-black/30"
                        : "border-neutral-800 bg-black/20",
                    ].join(" ")}
                  >
                    {it.icon}
                  </span>

                  <div className="min-w-0">
                    <div className="font-bold leading-tight">{it.label}</div>
                    <div className="text-xs text-neutral-500">
                      {subtitleFor(it.key)}
                    </div>
                  </div>

                  <span
                    className={[
                      "ml-auto text-xs font-extrabold px-2 py-1 rounded-full border",
                      isActive
                        ? "border-lime-400/30 text-lime-300 bg-black/20"
                        : "border-neutral-800 text-neutral-500 bg-black/10",
                    ].join(" ")}
                  >
                    {isActive ? "Activo" : "Ver"}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/55 shadow-[0_18px_55px_rgba(0,0,0,.55)] overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-800">
            <h2 className="text-xl font-extrabold text-white">{titleFor(active)}</h2>
            <p className="mt-1 text-sm text-neutral-400">{descFor(active)}</p>
          </div>

          <div className="p-6">
            {active === "compras" && (
              <div className="space-y-4">
                {ordersLoading && <SkeletonOrders />}

                {!ordersLoading && ordersErr && (
                  <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
                    {ordersErr}
                  </div>
                )}

                {!ordersLoading && orders && orders.length === 0 && (
                  <EmptyBlock
                    title="Aún no tienes compras"
                    text="Cuando hagas un pedido logueado, aparecerá aquí."
                    hint='Tip: asegúrate de estar logueado y luego hacer el checkout.'
                  />
                )}

                {!ordersLoading && orders && orders.length > 0 && (
                  <div className="space-y-4">
                    {orders.map((o) => (
                      <OrderCard key={o.id} order={o} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {active === "datos" && <ProfileForm userEmail={userEmail} />}

            {active === "direcciones" && (
              <EmptyBlock
                title="Direcciones"
                text="Aquí irá el CRUD de direcciones (tabla Address) y marcar una como default."
                hint="Luego hacemos /api/account/addresses (GET/POST/PUT/DELETE)."
              />
            )}

            {active === "facturacion" && (
              <EmptyBlock
                title="Datos de facturación"
                text="Aquí podrás guardar datos para boleta/factura."
                hint="Si quieres facturación real, conviene crear un modelo BillingProfile en Prisma."
              />
            )}

            {active === "password" && (
              <EmptyBlock
                title="Contraseña"
                text="Aquí irá el cambio de contraseña (actual + nueva)."
                hint="Se valida la actual con bcrypt y se actualiza passwordHash."
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileForm({ userEmail }: { userEmail: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [form, setForm] = useState<Profile>({
    name: "",
    lastName: "",
    phone: "",
    rut: "",
    email: userEmail,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr(null);
      setOkMsg(null);
      setLoading(true);
      try {
        const r = await fetch("/api/account/profile", { cache: "no-store" });
        const j = await r.json().catch(() => null);

        if (!r.ok || !j?.ok) {
          throw new Error(j?.error || `No se pudo cargar perfil (HTTP ${r.status}).`);
        }

        const u = j.user as any;

        if (!mounted) return;
        setForm({
          name: String(u?.name ?? "").trim(),
          lastName: String(u?.lastName ?? "").trim(),
          phone: String(u?.phone ?? "").trim(),
          rut: String(u?.rut ?? "").trim(),
          email: String(u?.email ?? userEmail).trim(),
        });
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Error al cargar datos.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userEmail]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);

    const name = form.name.trim();
    if (!name) {
      setErr("El nombre es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      const r = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          lastName: form.lastName,
          phone: form.phone,
          rut: form.rut,
        }),
      });

      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || `No se pudo guardar (HTTP ${r.status}).`);
      }

      setOkMsg("Datos actualizados correctamente.");
    } catch (e: any) {
      setErr(e?.message || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-black/20 p-5 animate-pulse">
        <div className="h-4 w-48 bg-neutral-800 rounded mb-3" />
        <div className="h-3 w-64 bg-neutral-800 rounded mb-2" />
        <div className="h-3 w-40 bg-neutral-800 rounded" />
      </div>
    );
  }

  return (
    <form onSubmit={onSave} className="space-y-4">
      <div className="rounded-2xl border border-neutral-800 bg-black/20 p-5">
        <div className="text-lg font-extrabold text-white">Datos personales</div>
        <p className="mt-2 text-sm text-neutral-300">
          Estos datos se usan para pre-rellenar el checkout y acelerar tu compra.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field
            label="Nombre"
            value={form.name}
            onChange={(v) => setForm((s) => ({ ...s, name: v }))}
            placeholder="Ej: Emilio"
          />
          <Field
            label="Apellido"
            value={form.lastName}
            onChange={(v) => setForm((s) => ({ ...s, lastName: v }))}
            placeholder="Ej: Recabarren"
          />
          <Field
            label="Teléfono"
            value={form.phone}
            onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
            placeholder="+56 9 1234 5678"
          />
          <Field
            label="RUT"
            value={form.rut}
            onChange={(v) => setForm((s) => ({ ...s, rut: v }))}
            placeholder="12.345.678-9"
          />
        </div>

        <div className="mt-4 text-xs text-neutral-500">
          Correo asociado: <span className="text-neutral-200 font-bold">{form.email}</span>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">
            {err}
          </div>
        )}

        {okMsg && (
          <div className="mt-4 rounded-2xl border border-lime-400/25 bg-lime-400/10 p-3 text-sm text-lime-200">
            {okMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full rounded-2xl bg-lime-400 px-4 py-2.5 font-extrabold text-neutral-950 hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-neutral-300 mb-1">{label}</label>
      <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-black/25 px-3">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent py-2.5 text-neutral-100 placeholder-neutral-500 outline-none"
        />
      </div>
    </div>
  );
}

function subtitleFor(key: TabKey) {
  switch (key) {
    case "compras":
      return "Historial de pedidos";
    case "datos":
      return "Tu información básica";
    case "direcciones":
      return "Envíos y retiro";
    case "facturacion":
      return "Boleta y factura";
    case "password":
      return "Seguridad de la cuenta";
  }
}

function titleFor(key: TabKey) {
  switch (key) {
    case "compras":
      return "Compras";
    case "datos":
      return "Datos personales";
    case "direcciones":
      return "Direcciones";
    case "facturacion":
      return "Datos de facturación";
    case "password":
      return "Contraseña";
  }
}

function descFor(key: TabKey) {
  switch (key) {
    case "compras":
      return "Revisa tus pedidos y sus estados.";
    case "datos":
      return "Actualiza tus datos personales.";
    case "direcciones":
      return "Gestiona tus direcciones guardadas.";
    case "facturacion":
      return "Guarda datos para boletas y facturas.";
    case "password":
      return "Actualiza tu contraseña de acceso.";
  }
}

function EmptyBlock({
  title,
  text,
  hint,
}: {
  title: string;
  text: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-black/20 p-5">
      <div className="text-lg font-extrabold text-white">{title}</div>
      <p className="mt-2 text-sm text-neutral-300">{text}</p>
      {hint ? <p className="mt-3 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

function SkeletonOrders() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-neutral-800 bg-black/20 p-4 animate-pulse"
        >
          <div className="h-4 w-48 bg-neutral-800 rounded mb-3" />
          <div className="h-3 w-64 bg-neutral-800 rounded mb-2" />
          <div className="h-3 w-40 bg-neutral-800 rounded" />
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const date = safeDate(order.createdAt);
  const total = moneyCLP(order.total);

  const status = statusLabel(order.status);
  const statusTone = statusClass(order.status);

  const pay = order.paymentMethod === "TRANSFER" ? "Transferencia" : "Tarjeta";
  const ship = order.shippingMethod === "PICKUP" ? "Retiro" : "Envío";

  return (
    <div className="rounded-2xl border border-neutral-800 bg-black/20 overflow-hidden">
      <div className="p-4 md:p-5 border-b border-neutral-800 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm text-neutral-400">Pedido</div>
            <div className="font-extrabold text-white truncate">
              #{order.id.slice(-8).toUpperCase()}
            </div>

            <span
              className={`ml-0 md:ml-2 inline-flex items-center rounded-full border px-2 py-1 text-xs font-extrabold ${statusTone}`}
            >
              {status}
            </span>

            <span className="inline-flex items-center rounded-full border border-neutral-800 bg-black/10 px-2 py-1 text-xs font-extrabold text-neutral-200">
              {ship}
            </span>

            <span className="inline-flex items-center rounded-full border border-neutral-800 bg-black/10 px-2 py-1 text-xs font-extrabold text-neutral-200">
              {pay}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400">
            <span>
              Fecha: <span className="text-neutral-200">{date}</span>
            </span>
            <span>
              Total: <span className="text-neutral-200">{total}</span>
            </span>
          </div>
        </div>

        {order.shipment?.trackingCode ? (
          <div className="text-xs text-neutral-400">
            Tracking:{" "}
            <span className="text-neutral-200 font-bold">
              {order.shipment.trackingCode}
            </span>
          </div>
        ) : null}
      </div>

      <div className="p-4 md:p-5">
        <div className="text-sm font-extrabold text-white">Productos</div>

        <div className="mt-3 space-y-2">
          {order.items?.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-black/10 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="font-bold text-neutral-200 truncate">
                  {it.productName}
                </div>
                <div className="text-xs text-neutral-500">
                  {it.quantity} × {moneyCLP(it.unitPrice)}
                </div>
              </div>
              <div className="text-sm font-extrabold text-white">
                {moneyCLP(it.unitPrice * it.quantity)}
              </div>
            </div>
          ))}
        </div>

        {(order.notes || order.shipment?.pickupLocation) ? (
          <div className="mt-4 rounded-xl border border-neutral-800 bg-black/10 p-3">
            {order.notes ? (
              <div className="text-xs text-neutral-400">
                Nota: <span className="text-neutral-200">{order.notes}</span>
              </div>
            ) : null}

            {order.shipment?.pickupLocation ? (
              <div className="mt-2 text-xs text-neutral-400">
                Dirección (guest):{" "}
                <span className="text-neutral-200">
                  {order.shipment.pickupLocation}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function moneyCLP(n: number) {
  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(n || 0));
  } catch {
    return `$${Number(n || 0)}`;
  }
}

function safeDate(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("es-CL", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

function statusLabel(s: OrderStatus) {
  switch (s) {
    case "PENDING_PAYMENT":
      return "Pendiente de pago";
    case "PAID":
      return "Pagado";
    case "PREPARING":
      return "Preparando";
    case "SHIPPED":
      return "Enviado";
    case "DELIVERED":
      return "Entregado";
    case "COMPLETED":
      return "Completado";
    case "CANCELLED":
      return "Cancelado";
    default:
      return s;
  }
}

function statusClass(s: OrderStatus) {
  switch (s) {
    case "PENDING_PAYMENT":
      return "border-amber-400/30 bg-amber-400/10 text-amber-200";
    case "PAID":
      return "border-lime-400/30 bg-lime-400/10 text-lime-200";
    case "PREPARING":
      return "border-sky-400/30 bg-sky-400/10 text-sky-200";
    case "SHIPPED":
      return "border-indigo-400/30 bg-indigo-400/10 text-indigo-200";
    case "DELIVERED":
    case "COMPLETED":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
    case "CANCELLED":
      return "border-red-400/30 bg-red-400/10 text-red-200";
    default:
      return "border-neutral-700 bg-black/10 text-neutral-200";
  }
}