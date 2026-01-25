"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // importante para que el navegador respete Set-Cookie
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok || !data?.ok) {
        setError(data?.error ?? "Error al iniciar sesión.");
        return;
      }

      // Destino después de loguearse
      const from = searchParams.get("from") || "/admin/pedidos";
      router.push(from);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl px-4 pb-10">
      <h1 className="mb-4 text-2xl font-extrabold text-white">
        Acceso administrador
      </h1>
      <p className="mb-4 text-sm text-neutral-300">
        Ingresa con las credenciales de administrador para revisar y gestionar
        los pedidos de la tienda.
      </p>

      {error && (
        <p className="mb-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mb-3">
        <label className="mb-1 block text-sm text-neutral-300">
          Correo
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-lime-400"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm text-neutral-300">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-lime-400"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`rounded-xl px-5 py-2 text-sm font-semibold ${
          loading
            ? "cursor-wait border border-neutral-700 bg-neutral-800 text-neutral-300"
            : "bg-lime-400 text-black hover:bg-lime-300"
        }`}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
