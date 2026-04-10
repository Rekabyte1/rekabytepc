"use client";

import React, { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import {
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaRegCircle,
} from "react-icons/fa";

type TabKey = "compras" | "datos" | "direcciones" | "facturacion" | "password";

type ApiOk<T> = { ok: true } & T;
type ApiErr = { ok: false; error: string };

type UserProfile = {
  id: string;
  email: string;
  name: string;
  lastName: string | null;
  phone: string | null;
  rut: string | null;
};

type Address = {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  number: string | null;
  apartment: string | null;
  city: string | null;
  commune: string | null;
  region: string;
  country: string;
  isDefault: boolean;
};

type OrderItem = {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
};

type Shipment = {
  type: "DELIVERY" | "PICKUP";
  pickupLocation: string | null;
  trackingCode: string | null;
  status: string;
};

type Order = {
  id: string;
  status: string;
  paymentMethod: "CARD" | "TRANSFER";
  shippingMethod: "DELIVERY" | "PICKUP";
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  paymentDueAt: string | null;
  items: OrderItem[];
  shipment: Shipment | null;
};

type BillingProfile = {
  documentType: "BOLETA" | "FACTURA";
  razonSocial: string | null;
  rutEmpresa: string | null;
  giro: string | null;
  address: string | null;
  city: string | null;
  commune: string | null;
  region: string | null;
};

function clp(n: number) {
  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${n}`;
  }
}

async function apiJSON<T>(url: string, init?: RequestInit): Promise<ApiOk<T> | ApiErr> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  if (!data) return { ok: false, error: "Respuesta inválida del servidor." };
  return data;
}

function scorePassword(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-ZÁÉÍÓÚÑ]/.test(password)) score += 1;
  if (/[a-záéíóúñ]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password)) score += 1;

  return score;
}

function getPasswordFeedback(password: string) {
  const checks = {
    minLength: password.length >= 8,
    uppercase: /[A-ZÁÉÍÓÚÑ]/.test(password),
    lowercase: /[a-záéíóúñ]/.test(password),
    number: /\d/.test(password),
    specialChar: /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password),
  };

  const score = scorePassword(password);

  let level: "débil" | "media" | "fuerte" = "débil";
  if (score >= 5) level = "fuerte";
  else if (score >= 3) level = "media";

  return { score, level, checks };
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition",
        active
          ? "border-lime-400/40 bg-lime-400/10"
          : "border-white/10 bg-white/5 hover:bg-white/7",
      ].join(" ")}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span
        className={[
          "text-xs px-2 py-1 rounded-full",
          active ? "bg-lime-400/15 text-lime-300" : "bg-white/5 text-white/60",
        ].join(" ")}
      >
        {active ? "Activo" : "Ver"}
      </span>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-white/70 mb-2">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-lime-400/30"
      />
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-white/70 mb-2">{label}</span>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 pr-11 text-sm outline-none focus:border-lime-400/30"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-lime-300 transition"
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </label>
  );
}

function PasswordStrength({
  password,
  confirmPassword,
}: {
  password: string;
  confirmPassword: string;
}) {
  const feedback = getPasswordFeedback(password);

  const barWidth =
    feedback.level === "débil"
      ? "33%"
      : feedback.level === "media"
      ? "66%"
      : "100%";

  const barColor =
    feedback.level === "débil"
      ? "bg-red-500"
      : feedback.level === "media"
      ? "bg-yellow-400"
      : "bg-lime-400";

  const match =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const mismatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const Item = ({
    ok,
    label,
  }: {
    ok: boolean;
    label: string;
  }) => (
    <div className="flex items-center gap-2 text-xs">
      {ok ? (
        <FaCheckCircle className="text-lime-400 shrink-0" />
      ) : (
        <FaRegCircle className="text-white/30 shrink-0" />
      )}
      <span className={ok ? "text-lime-200" : "text-white/55"}>{label}</span>
    </div>
  );

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">Seguridad de contraseña</span>
        <span
          className={[
            "text-xs px-2 py-1 rounded-full border",
            feedback.level === "débil"
              ? "border-red-500/30 bg-red-500/10 text-red-200"
              : feedback.level === "media"
              ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
              : "border-lime-400/30 bg-lime-400/10 text-lime-200",
          ].join(" ")}
        >
          {feedback.level === "débil"
            ? "Débil"
            : feedback.level === "media"
            ? "Media"
            : "Fuerte"}
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: password ? barWidth : "0%" }}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Item ok={feedback.checks.minLength} label="Al menos 8 caracteres" />
        <Item ok={feedback.checks.uppercase} label="Una mayúscula" />
        <Item ok={feedback.checks.lowercase} label="Una minúscula" />
        <Item ok={feedback.checks.number} label="Un número" />
        <Item ok={feedback.checks.specialChar} label="Un símbolo" />
        <Item ok={match} label="Confirmación coincide" />
      </div>

      {mismatch && (
        <div className="mt-3 text-xs text-red-300">
          La confirmación de contraseña no coincide.
        </div>
      )}
    </div>
  );
}

function TextArea({
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
    <label className="block">
      <span className="block text-xs text-white/70 mb-2">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[96px] rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-lime-400/30"
      />
    </label>
  );
}

export default function PanelClient({ initialTab }: { initialTab: string }) {
  const initial: TabKey = (
    ["compras", "datos", "direcciones", "facturacion", "password"].includes(initialTab)
      ? initialTab
      : "compras"
  ) as TabKey;

  const [tab, setTab] = useState<TabKey>(initial);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pName, setPName] = useState("");
  const [pLastName, setPLastName] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pRut, setPRut] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const pageSize = 10;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrMode, setAddrMode] = useState<"list" | "create" | "edit">("list");
  const [addrEditId, setAddrEditId] = useState<string | null>(null);

  const [aFullName, setAFullName] = useState("");
  const [aPhone, setAPhone] = useState("");
  const [aStreet, setAStreet] = useState("");
  const [aNumber, setANumber] = useState("");
  const [aApartment, setAApartment] = useState("");
  const [aCity, setACity] = useState("");
  const [aCommune, setACommune] = useState("");
  const [aRegion, setARegion] = useState("");
  const [aCountry, setACountry] = useState("Chile");
  const [aDefault, setADefault] = useState(false);

  const [billing, setBilling] = useState<BillingProfile>({
    documentType: "BOLETA",
    razonSocial: null,
    rutEmpresa: null,
    giro: null,
    address: null,
    city: null,
    commune: null,
    region: null,
  });

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");

  const [showCurPass, setShowCurPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showNewPass2, setShowNewPass2] = useState(false);

  const tabs: { key: TabKey; label: string; subtitle: string }[] = useMemo(
    () => [
      { key: "compras", label: "Compras", subtitle: "Historial de pedidos" },
      { key: "datos", label: "Datos personales", subtitle: "Tu información básica" },
      { key: "direcciones", label: "Direcciones", subtitle: "Envíos y retiro" },
      { key: "facturacion", label: "Datos de facturación", subtitle: "Boleta y factura" },
      { key: "password", label: "Contraseña", subtitle: "Seguridad de tu cuenta" },
    ],
    []
  );

  const passwordFeedback = useMemo(() => getPasswordFeedback(newPass), [newPass]);

  const canSubmitPassword = useMemo(() => {
    return (
      curPass.trim().length > 0 &&
      newPass.trim().length > 0 &&
      newPass2.trim().length > 0 &&
      newPass === newPass2 &&
      passwordFeedback.level !== "débil" &&
      curPass !== newPass
    );
  }, [curPass, newPass, newPass2, passwordFeedback.level]);

  function pushToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    window.setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    (async () => {
      const res = await apiJSON<{ user: UserProfile }>("/api/account/profile");
      if (!res.ok) return pushToast("err", res.error);

      setProfile(res.user);
      setPName(res.user.name || "");
      setPLastName(res.user.lastName || "");
      setPPhone(res.user.phone || "");
      setPRut(res.user.rut || "");

      const b = await apiJSON<{ billingProfile: BillingProfile | null }>("/api/account/billing");
      if (b.ok && b.billingProfile) setBilling(b.billingProfile);
    })();
  }, []);

  useEffect(() => {
    if (tab !== "compras") return;
    (async () => {
      const url = `/api/account/orders?page=${ordersPage}&pageSize=${pageSize}`;
      const res = await apiJSON<{ orders: Order[]; total: number }>(url);
      if (!res.ok) return pushToast("err", res.error);
      setOrders(res.orders || []);
      setOrdersTotal(res.total || 0);
    })();
  }, [tab, ordersPage]);

  useEffect(() => {
    if (tab !== "direcciones") return;
    (async () => {
      const res = await apiJSON<{ addresses: Address[] }>("/api/account/addresses");
      if (!res.ok) return pushToast("err", res.error);
      setAddresses(res.addresses || []);
      setAddrMode("list");
    })();
  }, [tab]);

  function resetAddressForm() {
    setAFullName("");
    setAPhone("");
    setAStreet("");
    setANumber("");
    setAApartment("");
    setACity("");
    setACommune("");
    setARegion("");
    setACountry("Chile");
    setADefault(false);
    setAddrEditId(null);
  }

  function fillAddressForm(a: Address) {
    setAFullName(a.fullName || "");
    setAPhone(a.phone || "");
    setAStreet(a.street || "");
    setANumber(a.number || "");
    setAApartment(a.apartment || "");
    setACity(a.city || "");
    setACommune(a.commune || "");
    setARegion(a.region || "");
    setACountry(a.country || "Chile");
    setADefault(Boolean(a.isDefault));
    setAddrEditId(a.id);
  }

  async function saveProfile() {
    setLoading(true);
    const res = await apiJSON<{ user: UserProfile }>("/api/account/profile", {
      method: "PUT",
      body: JSON.stringify({
        name: pName,
        lastName: pLastName,
        phone: pPhone,
        rut: pRut,
      }),
    });
    setLoading(false);

    if (!res.ok) return pushToast("err", res.error);
    setProfile(res.user);
    pushToast("ok", "Datos personales actualizados.");
  }

  async function loadAddresses() {
    const res = await apiJSON<{ addresses: Address[] }>("/api/account/addresses");
    if (!res.ok) return pushToast("err", res.error);
    setAddresses(res.addresses || []);
  }

  async function createAddress() {
    setLoading(true);
    const res = await apiJSON<{ address: Address }>("/api/account/addresses", {
      method: "POST",
      body: JSON.stringify({
        fullName: aFullName,
        phone: aPhone,
        street: aStreet,
        number: aNumber,
        apartment: aApartment,
        city: aCity,
        commune: aCommune,
        region: aRegion,
        country: aCountry,
        isDefault: aDefault,
      }),
    });
    setLoading(false);

    if (!res.ok) return pushToast("err", res.error);
    pushToast("ok", "Dirección creada.");
    await loadAddresses();
    setAddrMode("list");
    resetAddressForm();
  }

  async function updateAddress() {
    if (!addrEditId) return;
    setLoading(true);
    const res = await apiJSON<{ address: Address }>(`/api/account/addresses/${addrEditId}`, {
      method: "PUT",
      body: JSON.stringify({
        fullName: aFullName,
        phone: aPhone,
        street: aStreet,
        number: aNumber,
        apartment: aApartment,
        city: aCity,
        commune: aCommune,
        region: aRegion,
        country: aCountry,
        isDefault: aDefault,
      }),
    });
    setLoading(false);

    if (!res.ok) return pushToast("err", res.error);
    pushToast("ok", "Dirección actualizada.");
    await loadAddresses();
    setAddrMode("list");
    resetAddressForm();
  }

  async function deleteAddress(id: string) {
    if (!confirm("¿Eliminar esta dirección?")) return;
    setLoading(true);
    const res = await apiJSON<{}>(`/api/account/addresses/${id}`, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) return pushToast("err", res.error);
    pushToast("ok", "Dirección eliminada.");
    await loadAddresses();
  }

  async function saveBilling() {
    setLoading(true);
    const res = await apiJSON<{ billingProfile: BillingProfile }>("/api/account/billing", {
      method: "PUT",
      body: JSON.stringify(billing),
    });
    setLoading(false);

    if (!res.ok) return pushToast("err", res.error);
    setBilling(res.billingProfile);
    pushToast("ok", "Datos de facturación guardados.");
  }

async function changePassword() {
  setLoading(true);
  const res = await apiJSON<{}>("/api/account/password", {
    method: "PUT",
    body: JSON.stringify({
      currentPassword: curPass,
      newPassword: newPass,
      confirmPassword: newPass2,
    }),
  });
  setLoading(false);

  if (!res.ok) return pushToast("err", res.error);

  setCurPass("");
  setNewPass("");
  setNewPass2("");

  pushToast("ok", "Contraseña actualizada.");
}

const ordersMaxPage = Math.max(1, Math.ceil(ordersTotal / pageSize));

return (
  <div className="rb-container py-10">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <div className="text-white/60 text-sm mb-2">Inicio / Mi cuenta</div>
        <h1 className="text-3xl font-extrabold text-white">Mi cuenta</h1>
        <div className="text-white/60 mt-1 text-sm">{profile?.email || ""}</div>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        Cerrar sesión
      </button>
    </div>

    {toast && (
      <div
        className={[
          "mb-6 rounded-xl border px-4 py-3 text-sm",
          toast.type === "ok"
            ? "border-lime-400/30 bg-lime-400/10 text-lime-200"
            : "border-red-500/30 bg-red-500/10 text-red-200",
        ].join(" ")}
      >
        {toast.msg}
      </div>
    )}

    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      {/* Sidebar */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs tracking-widest text-lime-300/80 font-bold">MI CUENTA</div>
        <div className="text-xs text-white/60 mb-4">
          Gestiona tus datos y revisa tu historial.
        </div>

        <div className="space-y-3">
          {tabs.map((t) => (
            <TabButton
              key={t.key}
              active={tab === t.key}
              label={t.label}
              onClick={() => {
                setTab(t.key);
                const url = new URL(window.location.href);
                url.searchParams.set("tab", t.key);
                window.history.replaceState({}, "", url.toString());
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        {tab === "compras" && (
          <div>
            <h2 className="text-xl font-bold text-white">Compras</h2>
            <div className="text-sm text-white/60 mt-1">Revisa tus pedidos y sus estados.</div>

            <div className="mt-6 space-y-4">
              {orders.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
                  <div className="text-white font-semibold">Aún no tienes compras</div>
                  <div className="text-white/60 text-sm mt-2">
                    Cuando hagas un pedido logueado, aparecerá aquí.
                  </div>
                </div>
              ) : (
                orders.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <div className="text-white font-bold">
                          Pedido <span className="text-white/60 text-sm font-mono">{o.id}</span>
                        </div>
                        <div className="text-white/60 text-sm mt-1">
                          {new Date(o.createdAt).toLocaleString("es-CL")}
                          {o.paymentDueAt ? (
                            <> · Vence: {new Date(o.paymentDueAt).toLocaleString("es-CL")}</>
                          ) : null}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                            {o.status}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                            {o.paymentMethod === "TRANSFER" ? "Transferencia" : "Tarjeta"}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                            {o.shippingMethod === "PICKUP" ? "Retiro" : "Despacho"}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                            {o.items.reduce((acc, it) => acc + it.quantity, 0)} item(s)
                          </span>
                        </div>
                      </div>

                      <div className="min-w-[240px] rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs text-white/60 font-semibold mb-3">RESUMEN</div>
                        <div className="flex items-center justify-between text-sm text-white/80">
                          <span>Subtotal</span>
                          <span className="font-semibold">{clp(o.subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/80 mt-2">
                          <span>Envío</span>
                          <span className="font-semibold">{clp(o.shippingCost)}</span>
                        </div>
                        <div className="border-t border-white/10 my-3" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white font-bold">TOTAL</span>
                          <span className="text-lime-300 font-extrabold">{clp(o.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-white/10 pt-4">
                      <div className="text-sm text-white font-semibold mb-2">Productos</div>
                      <div className="space-y-2">
                        {o.items.map((it) => (
                          <div
                            key={it.id}
                            className="flex items-center justify-between text-sm text-white/80"
                          >
                            <span>
                              {it.productName} <span className="text-white/50">x{it.quantity}</span>
                            </span>
                            <span className="font-semibold">{clp(it.unitPrice * it.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {ordersTotal > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    disabled={ordersPage <= 1}
                    onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <div className="text-sm text-white/60">
                    Página {ordersPage} de {ordersMaxPage}
                  </div>
                  <button
                    disabled={ordersPage >= ordersMaxPage}
                    onClick={() => setOrdersPage((p) => Math.min(ordersMaxPage, p + 1))}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "datos" && (
          <div>
            <h2 className="text-xl font-bold text-white">Datos personales</h2>
            <div className="text-sm text-white/60 mt-1">Actualiza tus datos personales.</div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nombre" value={pName} onChange={setPName} placeholder="Ej: Juan" />
                <Field label="Apellido" value={pLastName} onChange={setPLastName} placeholder="Ej: Mellado" />
                <Field label="Teléfono" value={pPhone} onChange={setPPhone} placeholder="Ej: +56 9 1234 5678" />
                <Field label="RUT" value={pRut} onChange={setPRut} placeholder="Ej: 12.345.678-9" />
              </div>

              <button
                disabled={loading}
                onClick={saveProfile}
                className="mt-5 w-full rounded-xl bg-lime-400 px-4 py-3 text-sm font-extrabold text-black disabled:opacity-60"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        )}

        {tab === "direcciones" && (
          <div>
            <h2 className="text-xl font-bold text-white">Direcciones</h2>
            <div className="text-sm text-white/60 mt-1">Gestiona tus direcciones guardadas.</div>

            {addrMode === "list" && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-white/60">
                    {addresses.length ? `${addresses.length} dirección(es)` : "No tienes direcciones guardadas."}
                  </div>
                  <button
                    onClick={() => {
                      resetAddressForm();
                      setAddrMode("create");
                    }}
                    className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-bold text-black"
                  >
                    Agregar dirección
                  </button>
                </div>

                <div className="space-y-3">
                  {addresses.map((a) => (
                    <div key={a.id} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <div className="text-white font-bold flex items-center gap-2">
                            {a.fullName}
                            {a.isDefault && (
                              <span className="text-xs px-2 py-1 rounded-full bg-lime-400/15 text-lime-300 border border-lime-400/20">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-white/70 text-sm mt-1">{a.phone}</div>
                          <div className="text-white/70 text-sm mt-2">
                            {a.street} {a.number || ""} {a.apartment ? `Depto ${a.apartment}` : ""}
                          </div>
                          <div className="text-white/60 text-sm mt-1">
                            {(a.commune || a.city || "")} · {a.region} · {a.country}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              fillAddressForm(a);
                              setAddrMode("edit");
                            }}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteAddress(a.id)}
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(addrMode === "create" || addrMode === "edit") && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-white font-bold">
                    {addrMode === "create" ? "Nueva dirección" : "Editar dirección"}
                  </div>
                  <button
                    onClick={() => {
                      setAddrMode("list");
                      resetAddressForm();
                    }}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80"
                  >
                    Volver
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Nombre completo" value={aFullName} onChange={setAFullName} />
                  <Field label="Teléfono" value={aPhone} onChange={setAPhone} />
                  <Field label="Calle" value={aStreet} onChange={setAStreet} />
                  <Field label="Número" value={aNumber} onChange={setANumber} />
                  <Field label="Depto / Casa" value={aApartment} onChange={setAApartment} />
                  <Field label="Ciudad" value={aCity} onChange={setACity} placeholder="Opcional si usas comuna" />
                  <Field label="Comuna" value={aCommune} onChange={setACommune} placeholder="Opcional si usas ciudad" />
                  <Field label="Región" value={aRegion} onChange={setARegion} />
                  <Field label="País" value={aCountry} onChange={setACountry} />
                  <label className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      checked={aDefault}
                      onChange={(e) => setADefault(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-white/80">Marcar como dirección default</span>
                  </label>
                </div>

                <button
                  disabled={loading}
                  onClick={addrMode === "create" ? createAddress : updateAddress}
                  className="mt-5 w-full rounded-xl bg-lime-400 px-4 py-3 text-sm font-extrabold text-black disabled:opacity-60"
                >
                  {addrMode === "create" ? "Guardar dirección" : "Guardar cambios"}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "facturacion" && (
          <div>
            <h2 className="text-xl font-bold text-white">Datos de facturación</h2>
            <div className="text-sm text-white/60 mt-1">Guarda datos para boletas y facturas.</div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs text-white/70 mb-2">Tipo de documento</span>
                  <select
                    value={billing.documentType}
                    onChange={(e) =>
                      setBilling((b) => ({
                        ...b,
                        documentType: e.target.value as BillingProfile["documentType"],
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-lime-400/30"
                  >
                    <option value="BOLETA">Boleta</option>
                    <option value="FACTURA">Factura</option>
                  </select>
                </label>

                <div className="md:col-span-2 border-t border-white/10 my-2" />

                <Field
                  label="Razón social"
                  value={billing.razonSocial || ""}
                  onChange={(v) => setBilling((b) => ({ ...b, razonSocial: v }))}
                  placeholder="Solo si es factura"
                />
                <Field
                  label="RUT empresa"
                  value={billing.rutEmpresa || ""}
                  onChange={(v) => setBilling((b) => ({ ...b, rutEmpresa: v }))}
                  placeholder="Solo si es factura"
                />
                <Field
                  label="Giro"
                  value={billing.giro || ""}
                  onChange={(v) => setBilling((b) => ({ ...b, giro: v }))}
                  placeholder="Opcional"
                />
                <Field
                  label="Dirección"
                  value={billing.address || ""}
                  onChange={(v) => setBilling((b) => ({ ...b, address: v }))}
                  placeholder="Opcional"
                />
                <Field
                  label="Ciudad"
                  value={billing.city || ""}
                  onChange={(v) => setBilling((b) => ({ ...b, city: v }))}
                  placeholder="Opcional"
                />
                <Field
                  label="Comuna"
                  value={billing.commune || ""}
                  onChange={(v) => setBilling((b) => ({ ...b, commune: v }))}
                  placeholder="Opcional"
                />
                <Field
                  label="Región"
                  value={billing.region || ""}
                  onChange={(v) => setBilling((b) => ({ ...b, region: v }))}
                  placeholder="Opcional"
                />
              </div>

              <button
                disabled={loading}
                onClick={saveBilling}
                className="mt-5 w-full rounded-xl bg-lime-400 px-4 py-3 text-sm font-extrabold text-black disabled:opacity-60"
              >
                Guardar datos de facturación
              </button>
            </div>
          </div>
        )}

        {tab === "password" && (
          <div>
            <h2 className="text-xl font-bold text-white">Contraseña</h2>
            <div className="text-sm text-white/60 mt-1">
              Actualiza tu contraseña de acceso.
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block md:col-span-2">
                  <span className="block text-xs text-white/70 mb-2">
                    Contraseña actual
                  </span>
                  <div className="relative">
                    <input
                      type={showCurPass ? "text" : "password"}
                      value={curPass}
                      onChange={(e) => setCurPass(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 pr-11 text-sm text-white outline-none focus:border-lime-400/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-lime-300"
                      aria-label={showCurPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showCurPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="block text-xs text-white/70 mb-2">
                    Nueva contraseña
                  </span>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 pr-11 text-sm text-white outline-none focus:border-lime-400/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-lime-300"
                      aria-label={showNewPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showNewPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="block text-xs text-white/70 mb-2">
                    Confirmar nueva contraseña
                  </span>
                  <div className="relative">
                    <input
                      type={showNewPass2 ? "text" : "password"}
                      value={newPass2}
                      onChange={(e) => setNewPass2(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 pr-11 text-sm text-white outline-none focus:border-lime-400/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass2((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-lime-300"
                      aria-label={showNewPass2 ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showNewPass2 ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </label>
              </div>

              <button
                disabled={loading}
                onClick={changePassword}
                className="mt-5 w-full rounded-xl bg-lime-400 px-4 py-3 text-sm font-extrabold text-black disabled:opacity-60"
              >
                Cambiar contraseña
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
}