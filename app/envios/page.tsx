// app/envios/page.tsx
export const metadata = {
  title: "Envíos y retiros | RekaByte",
  description:
    "Despachos a Santiago y todo Chile vía Chilexpress, retiro coordinado, plazos y condiciones de entrega en RekaByte.",
};

export default function EnviosPage() {
  const updated = new Date().toLocaleDateString("es-CL");

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-white">Envíos y retiros</h1>
      <p className="mt-2 text-neutral-300">Última actualización: {updated}</p>

      <div className="mt-6 grid gap-5">
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Cobertura</h2>
          <ul className="list-disc space-y-2 pl-5 text-neutral-300">
            <li>Vendemos en Santiago y despachamos a todo Chile.</li>
            <li>
              Trabajamos exclusivamente con{" "}
              <span className="font-semibold text-white">Chilexpress</span>.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Retiro coordinado</h2>
          <ul className="list-disc space-y-2 pl-5 text-neutral-300">
            <li>
              El retiro se coordina{" "}
              <span className="font-semibold text-white">
                una vez procesado el pedido
              </span>{" "}
              (confirmación + preparación).
            </li>
            <li>
              Punto de retiro:{" "}
              <span className="font-semibold text-white">
                a pasos de Metro Lo Vial, San Miguel
              </span>{" "}
              (dirección exacta se entrega de forma privada al coordinar).
            </li>
            <li>Para retirar se solicitará N° de pedido y validación del comprador.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Despachos por Chilexpress</h2>
          <ul className="list-disc space-y-2 pl-5 text-neutral-300">
            <li>
              El <span className="font-semibold text-white">envío se paga aparte</span>.
              El costo se informa/coordina una vez procesado el pedido, según destino y
              tamaño/peso del paquete.
            </li>
            <li>
              Una vez despachado, enviaremos{" "}
              <span className="font-semibold text-white">número de seguimiento</span>.
            </li>
            <li>
              <span className="font-semibold text-white">Responsabilidad:</span> RekaByte se
              hace responsable del envío{" "}
              <span className="font-semibold text-white">
                hasta la recepción/entrega al destinatario
              </span>{" "}
              según confirmación del transportista.
            </li>
            <li>
              Recomendación: revisa el paquete al recibir. Si detectas daño externo, deja
              constancia con el transportista al momento de la entrega (esto es clave para
              gestionar reclamos).
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Plazos y preparación</h2>
          <ul className="list-disc space-y-2 pl-5 text-neutral-300">
            <li>
              Publicaremos principalmente equipos armados{" "}
              <span className="font-semibold text-white">listos para entrega inmediata</span>.
            </li>
            <li>
              Antes de entregar o despachar, podemos realizar control de calidad y pruebas
              (embalaje, revisión final, estrés básico). Esto puede añadir{" "}
              <span className="font-semibold text-white">24–72 horas hábiles</span> antes
              del retiro/despacho.
            </li>
            <li>
              Los plazos de transporte dependen de Chilexpress y del destino. En fechas de
              alta demanda puede haber demoras.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Datos incorrectos</h2>
          <ul className="list-disc space-y-2 pl-5 text-neutral-300">
            <li>
              Es responsabilidad del cliente ingresar correctamente nombre, teléfono y dirección.
            </li>
            <li>
              Si un envío es devuelto por datos erróneos o ausencia reiterada, los costos de
              reexpedición/devolución serán asumidos por el cliente.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Soporte</h2>
          <p className="text-neutral-300">
            Escríbenos a{" "}
            <a href="mailto:contacto@rekabyte.cl" className="text-lime-400 hover:underline">
              contacto@rekabyte.cl
            </a>{" "}
            o por WhatsApp para coordinar retiro/despacho.
          </p>
        </section>
      </div>
    </main>
  );
}
