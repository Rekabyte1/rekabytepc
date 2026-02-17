// app/garantias/page.tsx
export const metadata = {
  title: "Garantías y devoluciones | RekaByte",
  description:
    "Política de garantía, devoluciones y proceso de RMA para compras en RekaByte (Chile).",
};

export default function GarantiasPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-white">
        Garantías y devoluciones
      </h1>
      <p className="mt-2 text-neutral-300">
        Última actualización: {new Date().toLocaleDateString("es-CL")}
      </p>

      <div className="mt-6 grid gap-5">
        {/* Resumen */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Resumen</h2>
          <p className="text-neutral-300">
            En RekaByte armamos equipos y realizamos control de calidad antes de
            entregar o despachar. La garantía cubre{" "}
            <span className="font-bold text-neutral-200">
              fallas de fábrica / componente defectuoso
            </span>{" "}
            bajo las condiciones indicadas abajo. No cubre daños por uso,
            manipulación, modificaciones o causas externas.
          </p>
        </section>

        {/* Garantía RekaByte */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Garantía RekaByte</h2>
          <p className="text-neutral-300">
            Para comenzar, ofrecemos{" "}
            <span className="font-bold text-neutral-200">6 meses de garantía</span>{" "}
            en equipos armados, aplicable a{" "}
            <span className="font-bold text-neutral-200">
              fallas atribuibles a defecto de fábrica del componente
            </span>
            . El producto será evaluado por nuestro servicio técnico y/o por el
            canal del fabricante/distribuidor según corresponda.
          </p>
        </section>

        {/* DOA */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">
            DOA (falla inicial)
          </h2>
          <p className="text-neutral-300">
            Si el equipo presenta una falla al recibirlo o durante los primeros
            días de uso, contáctanos de inmediato. Revisaremos el caso para
            aplicar una solución prioritaria ( reemplazo del
            componente o alternativa disponible), sujeto a evaluación técnica y
            stock.
          </p>
        </section>

        {/* Exclusiones */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">
            Condiciones y exclusiones
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-neutral-300">
            <li>
              La garantía <span className="font-bold text-neutral-200">no cubre</span>{" "}
              daños por golpes, caídas, líquidos, humedad, polvo excesivo,
              intervención de terceros, mal uso, negligencia, uso fuera de
              especificación, overclock, daño por transporte posterior a la
              entrega, o desgaste normal.
            </li>
            <li>
              La garantía <span className="font-bold text-neutral-200">no cubre</span>{" "}
              daños por sobrevoltaje, variaciones eléctricas, descargas
              eléctricas, fuentes externas defectuosas, o instalaciones sin
              protección adecuada.
            </li>
            <li>
              Se debe entregar el producto con{" "}
              <span className="font-bold text-neutral-200">N° de pedido</span> y,
              idealmente, con todos sus accesorios y embalaje correcto.
            </li>
            <li>
              El diagnóstico técnico puede tardar entre{" "}
              <span className="font-bold text-neutral-200">3 y 10 días hábiles</span>{" "}
              según el caso y el canal de garantía aplicable.
            </li>
          </ul>
        </section>

        {/* Upgrades */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">
            Cambios y upgrades del cliente
          </h2>
          <p className="text-neutral-300">
            El cliente puede realizar cambios o upgrades (por ejemplo, añadir RAM
            o almacenamiento){" "}
            <span className="font-bold text-neutral-200">
              siempre que no afecten el funcionamiento del equipo
            </span>
            . Sin embargo,{" "}
            <span className="font-bold text-neutral-200">
              si después de una modificación el equipo presenta fallas asociadas
              a dicha intervención
            </span>
            , RekaByte no se hace responsable por daños o fallas derivadas de esa
            modificación.
          </p>
        </section>

        {/* Envíos por garantía */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">
            Envíos por garantía
          </h2>
          <p className="text-neutral-300">
            En caso de garantía/RMA:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-neutral-300">
            <li>
              El cliente paga el{" "}
              <span className="font-bold text-neutral-200">
                envío hacia RekaByte
              </span>
              .
            </li>
            <li>
              Si la falla está cubierta por garantía, RekaByte paga el{" "}
              <span className="font-bold text-neutral-200">
                envío de regreso al cliente
              </span>
              .
            </li>
          </ul>
          <p className="mt-2 text-neutral-400 text-sm">
            Recomendación: embalar correctamente y proteger el equipo para evitar
            daños en tránsito.
          </p>
        </section>

        {/* Cómo iniciar RMA */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Cómo iniciar un RMA</h2>
          <ol className="list-decimal space-y-1 pl-5 text-neutral-300">
            <li>
              Escríbenos a{" "}
              <a
                className="text-lime-400 hover:underline"
                href="mailto:contacto@rekabyte.cl"
              >
                contacto@rekabyte.cl
              </a>{" "}
              con tu N° de pedido.
            </li>
            <li>
              Adjunta fotos/video y una breve descripción del problema (ideal:
              cuándo ocurre, mensajes de error, y pasos para reproducir).
            </li>
            <li>
              Te responderemos con instrucciones de envío/entrega y los pasos de
              diagnóstico.
            </li>
          </ol>

          <p className="mt-3 text-neutral-400 text-sm">
            Al comprar en RekaByte, el cliente declara haber leído y aceptado
            estas políticas de garantía y devoluciones.
          </p>
        </section>
      </div>
    </main>
  );
}
