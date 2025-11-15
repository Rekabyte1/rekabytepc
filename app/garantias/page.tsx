// app/garantias/page.tsx
export const metadata = {
  title: "Garantías y devoluciones | RekaByte",
  description:
    "Información sobre garantía legal, DOA, garantía del fabricante y procesos de devolución/RMA en RekaByte.",
};

export default function GarantiasPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-white">Garantías y devoluciones</h1>
      <p className="mt-2 text-neutral-300">
        Última actualización: {new Date().toLocaleDateString("es-CL")}
      </p>

      <div className="mt-6 grid gap-5">
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Garantía legal</h2>
          <p className="text-neutral-300">
            Tienes derecho a reparación, cambio o devolución cuando un producto presente fallas de
            fabricación de acuerdo con la normativa vigente. El producto será evaluado por nuestro
            servicio técnico o el del fabricante.
          </p>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Producto DOA (falla dentro de los primeros días)</h2>
          <p className="text-neutral-300">
            Si el producto presenta falla dentro de los primeros días de uso, contáctanos para
            gestionar un reemplazo expedito, sujeto a disponibilidad y evaluación técnica.
          </p>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Garantía del fabricante</h2>
          <p className="text-neutral-300">
            Algunos productos cuentan con garantía directa del fabricante. En ese caso podemos
            ayudarte a gestionar el RMA o indicarte el canal oficial.
          </p>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Condiciones y exclusiones</h2>
          <ul className="list-disc space-y-1 pl-5 text-neutral-300">
            <li>No cubre daños por golpes, líquidos, sobrevoltajes o mal uso.</li>
            <li>Debe entregarse con número de pedido, accesorios y embalaje cuando sea posible.</li>
            <li>El diagnóstico técnico puede tardar entre 3 y 10 días hábiles según el caso.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Cómo iniciar un RMA</h2>
          <ol className="list-decimal space-y-1 pl-5 text-neutral-300">
            <li>Escríbenos a <a className="text-lime-400 hover:underline" href="mailto:contacto@rekabyte.cl">contacto@rekabyte.cl</a> con tu N° de pedido.</li>
            <li>Adjunta fotos/video y una breve descripción del problema.</li>
            <li>Te responderemos con instrucciones de retiro/traslado o entrega en punto de atención.</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
