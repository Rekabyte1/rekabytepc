// app/modelos/configurador/page.tsx

export default function ConfiguradorPage() {
  return (
    <main className="checkout-page">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-2 text-2xl font-extrabold text-white">Configurador</h1>
        <p className="text-neutral-300">
          Muy pronto podrás armar tu PC paso a paso (CPU, GPU, RAM, almacenamiento y gabinete), ver
          compatibilidades y el precio en tiempo real.
        </p>

        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
          <h2 className="mb-2 text-lg font-semibold text-white">Estado</h2>
          <p className="text-neutral-400">
            Esta sección está en construcción. Mientras tanto, puedes revisar{" "}
            <a href="/modelos" className="text-lime-400 hover:underline">
              todos los modelos
            </a>{" "}
            o los{" "}
            <a href="/modelos/stock" className="text-lime-400 hover:underline">
              equipos en stock
            </a>.
          </p>
        </div>
      </div>
    </main>
  );
}
