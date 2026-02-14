// app/cuenta/page.tsx
import { FaLock, FaRegUser, FaEnvelope } from "react-icons/fa";
import { HiKey } from "react-icons/hi2";

function Field({
  id,
  label,
  type,
  placeholder,
  icon,
}: {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-200" htmlFor={id}>
        {label}
      </label>

      <div className="group relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-lime-400">
          {icon}
        </span>

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className={[
            "w-full rounded-xl border border-neutral-800 bg-neutral-950/40",
            "pl-10 pr-3 py-2.5 text-neutral-100 placeholder-neutral-600",
            "outline-none transition",
            "focus:border-lime-400/70 focus:ring-2 focus:ring-lime-400/15",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className={[
        "relative overflow-hidden rounded-2xl border border-neutral-800",
        "bg-neutral-950/55 shadow-[0_18px_55px_rgba(0,0,0,.55)]",
      ].join(" ")}
    >
      {/* glow suave */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[520px] -translate-x-1/2 rounded-full bg-lime-400/10 blur-3xl"
      />

      <header className="relative border-b border-neutral-800 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-black/40 text-lime-400">
            {icon}
          </div>

          <div>
            <h2 className="text-base font-extrabold tracking-tight text-white">{title}</h2>
            <p className="mt-0.5 text-xs text-neutral-400">{subtitle}</p>
          </div>
        </div>
      </header>

      <div className="relative px-6 py-5">{children}</div>
    </section>
  );
}

export default function CuentaPage() {
  return (
    <main className="rb-container py-10">
      {/* Hero */}
      <div className="relative mx-auto max-w-5xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-8 h-24 bg-gradient-to-b from-lime-400/10 to-transparent blur-2xl"
        />

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-black/40 px-3 py-1 text-xs font-extrabold tracking-widest text-lime-400">
            CUENTA
          </div>

          <h1 className="mt-3 text-center text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Mi cuenta
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm text-neutral-300">
            Inicia sesión para ver tus compras y administrar tus datos, o crea una cuenta en segundos.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Acceder */}
          <Card
            title="Acceder"
            subtitle="Vuelve a tu cuenta para ver compras y datos."
            icon={<FaLock />}
          >
            <form className="space-y-4">
              <Field
                id="login-email"
                label="Usuario o correo"
                type="email"
                placeholder="Ingresa tu correo"
                icon={<FaEnvelope />}
              />

              <Field
                id="login-pass"
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                icon={<HiKey />}
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-950 text-lime-400 focus:ring-0"
                  />
                  Recuérdame
                </label>

                <a
                  href="#"
                  className="text-sm font-medium text-lime-400 hover:text-lime-300 underline underline-offset-2"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                className={[
                  "mt-2 w-full rounded-xl px-4 py-2.5 font-extrabold",
                  "bg-lime-400 text-neutral-950 hover:brightness-110",
                  "transition shadow-[0_10px_25px_rgba(182,255,46,.12)]",
                ].join(" ")}
              >
                Ingresar
              </button>

              <p className="pt-2 text-xs text-neutral-500">
                Consejo: usa el mismo correo con el que realizaste compras si ya compraste antes.
              </p>
            </form>
          </Card>

          {/* Registrarse */}
          <Card
            title="Crear cuenta"
            subtitle="Guarda tus datos y revisa tu historial de compras."
            icon={<FaRegUser />}
          >
            <form className="space-y-4">
              <Field
                id="reg-email"
                label="Correo electrónico"
                type="email"
                placeholder="ejemplo@email.com"
                icon={<FaEnvelope />}
              />

              <Field
                id="reg-pass"
                label="Crea una contraseña"
                type="password"
                placeholder="Mínimo 8 caracteres"
                icon={<HiKey />}
              />

              <div className="rounded-xl border border-neutral-800 bg-black/30 p-3">
                <p className="text-xs text-neutral-400">
                  Al crear una cuenta aceptas nuestras condiciones y el uso de tus datos para mejorar
                  tu experiencia.
                </p>
              </div>

              <button
                type="submit"
                className={[
                  "w-full rounded-xl px-4 py-2.5 font-extrabold",
                  "bg-lime-400 text-neutral-950 hover:brightness-110",
                  "transition shadow-[0_10px_25px_rgba(182,255,46,.12)]",
                ].join(" ")}
              >
                Crear cuenta
              </button>

              <div className="pt-2 text-xs text-neutral-500">
                ¿Ya tienes cuenta?{" "}
                <span className="text-neutral-400">Usa el formulario de Acceder.</span>
              </div>
            </form>
          </Card>
        </div>

        {/* Ayuda */}
        <div className="mt-7 text-center text-sm text-neutral-400">
          ¿Necesitas ayuda? Escríbenos a{" "}
          <a
            href="mailto:contacto@rekabyte.cl"
            className="font-semibold text-lime-400 hover:text-lime-300 underline underline-offset-2"
          >
            contacto@rekabyte.cl
          </a>
          .
        </div>
      </div>
    </main>
  );
}
