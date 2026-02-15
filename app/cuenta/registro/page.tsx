"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaRegUser, FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";

export default function RegistroPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (pass.length < 8) {
      setErr("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // 1) Crear usuario en BD
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: pass }),
      });

      const data = await r.json().catch(() => null);

      if (!r.ok) {
        setErr(data?.error || "No se pudo crear la cuenta.");
        setLoading(false);
        return;
      }

      // 2) Auto-login (Credentials)
      const login = await signIn("credentials", {
        redirect: false,
        email,
        password: pass,
      });

      if (login?.error) {
        // Si por algo falla el login, igual lo llevamos a /cuenta para que inicie
        router.replace("/cuenta");
        router.refresh();
        return;
      }

      // 3) Panel
      router.replace("/cuenta/panel");
      router.refresh();
    } catch {
      setErr("Error inesperado. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="rb-container py-10">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => router.push("/cuenta")}
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-black/25 px-3 py-2 text-sm text-neutral-200 hover:bg-black/35"
        >
          <FaArrowLeft /> Volver
        </button>

        <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/55 shadow-[0_18px_55px_rgba(0,0,0,.55)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_260px_at_20%_0%,rgba(182,255,46,.10),transparent_55%)]" />

          <header className="relative border-b border-neutral-800 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-800 bg-black/30">
                <FaRegUser className="text-lime-400" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Crear cuenta
                </h1>
                <p className="text-sm text-neutral-400">
                  Regístrate para guardar datos y ver tus compras.
                </p>
              </div>
            </div>
          </header>

          <form onSubmit={onRegister} className="relative px-6 py-6 space-y-4">
            <div>
              <label className="block text-sm text-neutral-300 mb-1">Nombre</label>
              <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-black/25 px-3">
                <FaRegUser className="text-neutral-500" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Emilio"
                  className="w-full bg-transparent py-2.5 text-neutral-100 placeholder-neutral-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-1">Correo</label>
              <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-black/25 px-3">
                <FaEnvelope className="text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@email.com"
                  className="w-full bg-transparent py-2.5 text-neutral-100 placeholder-neutral-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-1">Contraseña</label>
              <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-black/25 px-3">
                <FaLock className="text-neutral-500" />
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-transparent py-2.5 text-neutral-100 placeholder-neutral-500 outline-none"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Usa una contraseña segura (mínimo 8 caracteres).
              </p>
            </div>

            {err && (
              <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-lime-400 px-4 py-2.5 font-extrabold text-neutral-950 hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/cuenta")}
              className="w-full rounded-2xl border border-neutral-800 bg-black/25 px-4 py-2.5 font-bold text-neutral-200 hover:bg-black/35"
            >
              Volver a iniciar sesión
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
