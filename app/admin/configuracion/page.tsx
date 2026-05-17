export default function AdminConfiguracionPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-100">
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_260px_at_5%_0%,rgba(163,230,53,0.13),transparent_60%)]" />

        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-lime-300">
            Configuración
          </p>
          <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">
            Configuración del panel
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
            Próximamente: parámetros operativos, preferencias internas y ajustes del backoffice.
          </p>

          <div className="mt-6 rounded-2xl border border-neutral-800 bg-black/25 p-4 text-sm text-neutral-400">
            Esta pantalla queda como placeholder controlado. No toca checkout, pagos, webhook ni stock.
          </div>
        </div>
      </section>
    </main>
  );
}