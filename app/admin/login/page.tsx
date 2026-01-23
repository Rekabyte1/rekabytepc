import { Suspense } from "react";
import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-neutral-100">
      <h1 className="mb-4 text-2xl font-extrabold text-white">
        Acceso administrador
      </h1>

      <p className="mb-6 text-sm text-neutral-400 max-w-xl">
        Ingresa con las credenciales de administrador para revisar y gestionar
        los pedidos de la tienda.
      </p>

      <Suspense fallback={null}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
