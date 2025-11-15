// app/envios/page.tsx
export const metadata = {
  title: "Envíos y retiros | RekaByte",
  description:
    "Plazos, costos y modalidades de retiro en punto y despachos a domicilio para tus compras en RekaByte.",
};

export default function EnviosPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-white">Envíos y retiros</h1>
      <p className="mt-2 text-neutral-300">
        Última actualización: {new Date().toLocaleDateString("es-CL")}
      </p>

      <div className="mt-6 grid gap-5">
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Retiro en punto</h2>
          <ul className="list-disc space-y-1 pl-5 text-neutral-300">
            <li>Retiro con <span className="font-semibold">código PIN</span> y número de pedido.</li>
            <li>Horario de atención: Lunes a Viernes, 10:00–18:30 hrs.</li>
            <li>Dirección: <span className="font-semibold">Real Audiencia 1170, San Miguel, RM</span> (modifícalo si corresponde).</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Despachos</h2>
          <ul className="list-disc space-y-1 pl-5 text-neutral-300">
            <li>Envíos a todo Chile vía courier. El costo se informa en el checkout o por correo.</li>
            <li>Una vez despachado, recibirás <span className="font-semibold">número de seguimiento</span>.</li>
            <li>Revisa el paquete al recibirlo. Si presenta daños, deja constancia con el transportista.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Preparación de pedido</h2>
          <p className="text-neutral-300">
            Los equipos armados requieren pruebas de estrés y control de calidad. Esto puede añadir
            24–72 h hábiles antes del despacho o retiro.
          </p>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-2 text-xl font-bold text-white">Consultas y soporte</h2>
          <p className="text-neutral-300">
            Escríbenos a{" "}
            <a href="mailto:contacto@rekabyte.cl" className="text-lime-400 hover:underline">
              contacto@rekabyte.cl
            </a>{" "}
            o por WhatsApp. Estaremos felices de ayudarte.
          </p>
        </section>
      </div>
    </main>
  );
}
