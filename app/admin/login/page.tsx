import { Suspense } from "react";
import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-14 text-neutral-100">
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 md:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_280px_at_10%_0%,rgba(163,230,53,0.12),transparent_55%)]" />
        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">RekaByte Admin</p>
          <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">Acceso administrador</h1>
          <p className="mt-3 max-w-2xl text-sm text-neutral-400">
            Ingresa con tus credenciales para revisar pedidos, actualizar estados y operar el panel de forma segura.
          </p>

          <Suspense fallback={null}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}