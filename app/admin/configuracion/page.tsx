import Link from "next/link";

export const dynamic = "force-dynamic";

type SystemItem = {
  label: string;
  description: string;
  status: "OK" | "REVISAR" | "PENDIENTE";
  detail: string;
};

function statusTone(status: SystemItem["status"]) {
  switch (status) {
    case "OK":
      return "border-lime-400/40 bg-lime-400/10 text-lime-200";
    case "REVISAR":
      return "border-amber-400/40 bg-amber-400/10 text-amber-200";
    case "PENDIENTE":
      return "border-sky-400/40 bg-sky-400/10 text-sky-200";
    default:
      return "border-neutral-700 bg-black/25 text-neutral-300";
  }
}

function hasEnv(name: string) {
  return Boolean(process.env[name]);
}

export default function AdminConfiguracionPage() {
  const systemItems: SystemItem[] = [
    {
      label: "Admin protegido",
      description: "Las rutas /admin y /api/admin están protegidas por middleware.",
      status: hasEnv("ADMIN_TOKEN") ? "OK" : "REVISAR",
      detail: hasEnv("ADMIN_TOKEN")
        ? "ADMIN_TOKEN detectado en entorno."
        : "Falta revisar ADMIN_TOKEN en variables de entorno.",
    },
    {
      label: "Base de datos",
      description: "Conexión Prisma/Supabase mediante DATABASE_URL.",
      status: hasEnv("DATABASE_URL") ? "OK" : "REVISAR",
      detail: hasEnv("DATABASE_URL")
        ? "DATABASE_URL detectado."
        : "Falta DATABASE_URL en entorno.",
    },
    {
      label: "Correos transaccionales",
      description: "Resend para confirmaciones y notificaciones de pedidos.",
      status: hasEnv("RESEND_API_KEY") ? "OK" : "REVISAR",
      detail: hasEnv("RESEND_API_KEY")
        ? "RESEND_API_KEY detectado."
        : "Falta revisar RESEND_API_KEY.",
    },
    {
      label: "Mercado Pago",
      description: "Preferencias de pago y webhook de confirmación.",
      status: hasEnv("MERCADOPAGO_ACCESS_TOKEN") ? "OK" : "REVISAR",
      detail: hasEnv("MERCADOPAGO_ACCESS_TOKEN")
        ? "Token de Mercado Pago detectado."
        : "Falta revisar token de Mercado Pago.",
    },
    {
      label: "Webhook Mercado Pago",
      description: "Validación de firma y recepción de notificaciones.",
      status: hasEnv("MERCADOPAGO_WEBHOOK_SECRET") ? "OK" : "REVISAR",
      detail: hasEnv("MERCADOPAGO_WEBHOOK_SECRET")
        ? "Webhook secret detectado."
        : "Falta revisar MERCADOPAGO_WEBHOOK_SECRET.",
    },
    {
      label: "Cron reservas",
      description: "Liberación automática de reservas vencidas.",
      status: hasEnv("CRON_SECRET") ? "OK" : "REVISAR",
      detail: hasEnv("CRON_SECRET")
        ? "CRON_SECRET detectado."
        : "Falta revisar CRON_SECRET.",
    },
  ];

  const adminModules = [
    {
      title: "Dashboard",
      href: "/admin",
      description: "KPIs diarios, cola de acción y últimos pedidos.",
      status: "Activo",
    },
    {
      title: "Operaciones",
      href: "/admin/operaciones",
      description: "Alertas de stock, prioridades y acciones recomendadas.",
      status: "Activo",
    },
    {
      title: "Pedidos",
      href: "/admin/pedidos",
      description: "Gestión operativa de pedidos y detalle por pedido.",
      status: "Activo",
    },
    {
      title: "Reportes",
      href: "/admin/reportes",
      description: "Inteligencia comercial, productos hot y rotación.",
      status: "Activo",
    },
    {
      title: "Productos",
      href: "/admin/productos",
      description: "Catálogo operativo read-only con señales comerciales.",
      status: "Activo",
    },
    {
      title: "Clientes",
      href: "/admin/clientes",
      description: "Compradores, recurrencia, gasto y oportunidades.",
      status: "Activo",
    },
  ];

  const operationalChecklist = [
    "Revisar /admin/operaciones antes de publicar productos o hacer campañas.",
    "Revisar pedidos PENDING_PAYMENT vencidos y PAID sin procesar.",
    "Confirmar stock antes de empujar productos en Instagram/TikTok.",
    "Evitar reponer productos sin ventas hasta revisar precio, ficha e imagen.",
    "Mantener productos HOT visibles y con stock suficiente.",
    "Revisar reportes después de cada campaña o carga de productos nueva.",
  ];

  const okCount = systemItems.filter((item) => item.status === "OK").length;
  const reviewCount = systemItems.filter((item) => item.status === "REVISAR").length;
  const pendingCount = systemItems.filter((item) => item.status === "PENDIENTE").length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-100">
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/60 p-5 md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_260px_at_5%_0%,rgba(163,230,53,0.13),transparent_60%)]" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-lime-300">
              Configuración
            </p>
            <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">
              Estado del backoffice
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
              Vista read-only para revisar salud general del panel, servicios esperados, módulos
              activos y checklist operativo. No muestra secretos ni modifica configuración.
            </p>
          </div>

          <Link
            href="/admin/operaciones"
            className="inline-flex w-fit items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10 px-5 py-3 text-sm font-black text-lime-200 hover:bg-lime-400/15"
          >
            Ver operaciones
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Servicios OK" value={okCount} hint="Variables detectadas" tone="text-lime-200" />
        <KpiCard label="Por revisar" value={reviewCount} hint="Configuración pendiente de validar" tone="text-amber-200" />
        <KpiCard label="Pendientes" value={pendingCount} hint="Módulos futuros" tone="text-sky-200" />
        <KpiCard label="Modo" value="Read-only" hint="Sin cambios sensibles desde esta vista" tone="text-white" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950/60">
          <div className="border-b border-neutral-800 p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
              Servicios esperados
            </p>
            <h2 className="mt-2 text-xl font-black text-white">
              Checklist técnico seguro
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Solo se valida presencia de variables. No se expone ningún valor sensible.
            </p>
          </div>

          <div className="divide-y divide-neutral-900">
            {systemItems.map((item) => (
              <div key={item.label} className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="font-black text-white">{item.label}</div>
                  <p className="mt-1 text-sm leading-6 text-neutral-400">{item.description}</p>
                  <p className="mt-2 text-xs text-neutral-500">{item.detail}</p>
                </div>

                <div>
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-lime-400/20 bg-lime-400/[0.04] p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
            Operación diaria
          </p>
          <h2 className="mt-2 text-xl font-black text-white">
            Checklist recomendado
          </h2>

          <div className="mt-4 space-y-3">
            {operationalChecklist.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-neutral-800 bg-black/25 p-4 text-sm leading-6 text-neutral-300"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-950/60">
        <div className="border-b border-neutral-800 p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
            Módulos activos
          </p>
          <h2 className="mt-2 text-xl font-black text-white">Mapa del admin</h2>
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
          {adminModules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="rounded-3xl border border-neutral-800 bg-black/20 p-4 transition hover:border-lime-400/30 hover:bg-lime-400/[0.04]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-black text-white">{module.title}</div>
                  <p className="mt-2 text-sm leading-6 text-neutral-400">{module.description}</p>
                </div>

                <Badge tone="border-lime-400/40 bg-lime-400/10 text-lime-200">
                  {module.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-950/60 p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">
          Próximas mejoras recomendadas
        </p>
        <h2 className="mt-2 text-xl font-black text-white">Roadmap interno</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <RoadmapCard title="Alertas por correo" text="Resumen diario de stock crítico y productos fuertes en riesgo." />
          <RoadmapCard title="Edición segura de productos" text="Activar/desactivar productos, featured y ajustes controlados." />
          <RoadmapCard title="Historial de stock" text="Registrar movimientos para detectar quiebres y reposición real." />
          <RoadmapCard title="Analytics marketing" text="Conectar campañas, contenido y productos con ventas." />
        </div>
      </section>
    </main>
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint: string;
  tone: string;
}) {
  return (
    <article className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-neutral-500">
        {label}
      </p>
      <div className={`mt-3 text-3xl font-black ${tone}`}>{value}</div>
      <p className="mt-2 text-xs leading-5 text-neutral-500">{hint}</p>
    </article>
  );
}

function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2 py-1 text-[11px] font-extrabold",
        tone,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function RoadmapCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-black/25 p-4">
      <div className="font-black text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-neutral-400">{text}</p>
    </div>
  );
}