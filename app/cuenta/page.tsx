"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaLock, FaRegUser } from "react-icons/fa";

export default function CuentaPage() {
  const router = useRouter();
  const { status } = useSession();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [remember, setRemember] = useState(true);
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Si ya hay sesión → manda al panel (sin que el usuario vea el form)
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/cuenta/panel");
    }
  }, [status, router]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr(null);
    setLoginLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: loginEmail,
      password: loginPass,
    });

    setLoginLoading(false);

    if (res?.error) {
      setLoginErr("Correo o contraseña incorrectos.");
      return;
    }

    router.replace("/cuenta/panel");
    router.refresh();
  };

  // Mientras NextAuth resuelve la sesión
  if (status === "loading") {
    return (
      <main className="rb-container py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-6 text-neutral-300">
            Cargando…
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="rb-container py-10">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Mi cuenta
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Inicia sesión o crea una cuenta para ver tus compras y guardar tus datos.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* ACCEDER */}
          <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/55 shadow-[0_18px_55px_rgba(0,0,0,.55)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_260px_at_20%_0%,rgba(182,255,46,.10),transparent_55%)]" />

            <header className="relative flex items-center justify-between gap-4 border-b border-neutral-800 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-800 bg-black/30">
                  <FaLock className="text-lime-400" />
                </span>
                <div>
                  <h2 className="font-extrabold text-white leading-tight">Acceder</h2>
                  <p className="text-xs text-neutral-400">Entra con tu correo y contraseña.</p>
                </div>
              </div>

              <span className="hidden sm:inline-flex rounded-full border border-neutral-800 bg-black/25 px-3 py-1 text-xs text-neutral-300">
                Acceso seguro
              </span>
            </header>

            <form onSubmit={onLogin} className="relative p-5 space-y-4">
              <div>
                <label className="block text-sm text-neutral-300 mb-1" htmlFor="login-email">
                  Correo
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full rounded-2xl border border-neutral-800 bg-black/25 px-3 py-2.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-300 mb-1" htmlFor="login-pass">
                  Contraseña
                </label>
                <input
                  id="login-pass"
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-neutral-800 bg-black/25 px-3 py-2.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-lime-400 focus:ring-0"
                  />
                  Recuérdame
                </label>

                <button
                  type="button"
                  className="text-sm text-lime-400 hover:text-lime-300 underline underline-offset-2"
                  onClick={() => alert("Pendiente: flujo de recuperación de contraseña.")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {loginErr && (
                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">
                  {loginErr}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-2xl bg-lime-400 px-4 py-2.5 font-extrabold text-neutral-950 hover:brightness-110 disabled:opacity-60"
              >
                {loginLoading ? "Ingresando..." : "Ingresar"}
              </button>

              <p className="text-xs text-neutral-500">
                {remember
                  ? "Mantendremos la sesión activa en este dispositivo."
                  : "La sesión se cerrará al terminar."}
              </p>
            </form>
          </section>

          {/* CREAR CUENTA */}
          <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/55 shadow-[0_18px_55px_rgba(0,0,0,.55)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_260px_at_80%_0%,rgba(182,255,46,.08),transparent_55%)]" />

            <header className="relative flex items-center justify-between gap-4 border-b border-neutral-800 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-800 bg-black/30">
                  <FaRegUser className="text-lime-400" />
                </span>
                <div>
                  <h2 className="font-extrabold text-white leading-tight">Crear cuenta</h2>
                  <p className="text-xs text-neutral-400">Guarda tus datos y revisa tus compras.</p>
                </div>
              </div>

              <span className="hidden sm:inline-flex rounded-full border border-neutral-800 bg-black/25 px-3 py-1 text-xs text-neutral-300">
                Gratis
              </span>
            </header>

            <div className="relative p-5 space-y-4">
              <div className="rounded-2xl border border-neutral-800 bg-black/20 p-4">
                <ul className="text-sm text-neutral-300 space-y-2">
                  <li>• Historial de compras</li>
                  <li>• Direcciones guardadas</li>
                  <li>• Datos de facturación</li>
                  <li>• Cambio de contraseña</li>
                </ul>
              </div>

              <button
                onClick={() => router.push("/cuenta/registro")}
                className="w-full rounded-2xl border border-lime-400/40 bg-black/25 px-4 py-2.5 font-extrabold text-lime-300 hover:bg-black/35"
              >
                Ir a registro
              </button>

              <p className="text-xs text-neutral-500">
                Al registrarte aceptas nuestras condiciones y el uso de tus datos para mejorar tu
                experiencia.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-6 text-center text-sm text-neutral-400">
          ¿Necesitas ayuda? Escríbenos a{" "}
          <a href="mailto:contacto@rekabyte.cl" className="text-lime-400 hover:text-lime-300">
            contacto@rekabyte.cl
          </a>
          .
        </div>
      </div>
    </main>
  );
}
