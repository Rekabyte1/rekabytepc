// app/cuenta/page.tsx
import { FaLock, FaRegUser, FaEnvelope } from "react-icons/fa";

export default function CuentaPage() {
  return (
    <main className="rb-container py-10">
      <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Mi cuenta
      </h1>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Card: Acceder */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 shadow-[0_10px_40px_rgba(0,0,0,.45)]">
          <header className="flex items-center gap-2 border-b border-neutral-800 px-5 py-4">
            <FaLock className="text-lime-400" />
            <h2 className="font-semibold text-white">Acceder</h2>
          </header>

          <form className="p-5 space-y-4">
            <div>
              <label className="block text-sm text-neutral-300 mb-1" htmlFor="login-email">
                Usuario o correo
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="Ingresa tu correo"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 focus:border-lime-400"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-1" htmlFor="login-pass">
                Contraseña
              </label>
              <input
                id="login-pass"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 focus:border-lime-400"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-lime-400 focus:ring-0"
                />
                Recuérdame
              </label>

              <a
                href="#"
                className="text-sm text-lime-400 hover:text-lime-300 underline underline-offset-2"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-lime-400 px-4 py-2 font-semibold text-neutral-900 hover:brightness-110"
            >
              Ingresar
            </button>
          </form>
        </section>

        {/* Card: Registrarse */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 shadow-[0_10px_40px_rgba(0,0,0,.45)]">
          <header className="flex items-center gap-2 border-b border-neutral-800 px-5 py-4">
            <FaRegUser className="text-lime-400" />
            <h2 className="font-semibold text-white">Registrarse</h2>
          </header>

          <form className="p-5 space-y-4">
            <div>
              <label className="block text-sm text-neutral-300 mb-1" htmlFor="reg-email">
                Correo electrónico
              </label>
              <input
                id="reg-email"
                type="email"
                placeholder="ejemplo@email.com"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 focus:border-lime-400"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-1" htmlFor="reg-pass">
                Crea una contraseña
              </label>
              <input
                id="reg-pass"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 focus:border-lime-400"
              />
            </div>

            <p className="text-xs text-neutral-400">
              Al registrarte aceptas nuestras condiciones y el uso de tus datos para mejorar tu
              experiencia.
            </p>

            <button
              type="submit"
              className="w-full rounded-lg bg-lime-400 px-4 py-2 font-semibold text-neutral-900 hover:brightness-110"
            >
              Crear cuenta
            </button>
          </form>
        </section>
      </div>

      {/* Tip / ayuda */}
      <div className="mt-6 text-center text-sm text-neutral-400">
        ¿Necesitas ayuda? Escríbenos a{" "}
        <a href="mailto:rekabytepc@gmail.com" className="text-lime-400 hover:text-lime-300">
          rekabytepc@gmail.com
        </a>
        .
      </div>
    </main>
  );
}
