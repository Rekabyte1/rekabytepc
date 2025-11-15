// app/terminos/page.tsx
export const metadata = {
  title: "Términos y condiciones | RekaByte",
};

export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-4">Términos y condiciones</h1>
      <p className="text-neutral-300 mb-6">
        Estos términos regulan la compra de productos y servicios en RekaByte.
      </p>

      <section className="space-y-4 text-neutral-300">
        <h2 className="text-xl font-bold text-white">1. Información general</h2>
        <p>Somos RekaByte SpA. Las ventas se procesan en CLP e incluyen boleta o factura.</p>

        <h2 className="text-xl font-bold text-white">2. Precios y pagos</h2>
        <p>
          Los precios pueden variar sin previo aviso. Métodos: transferencia (con
          descuento publicado) y Webpay/Mercado Pago (precio normal).
        </p>

        <h2 className="text-xl font-bold text-white">3. Stock y tiempos</h2>
        <p>
          El stock se confirma al momento del pago. En equipos armados, el armado y
          pruebas pueden tomar 1–5 días hábiles.
        </p>

        <h2 className="text-xl font-bold text-white">4. Garantías</h2>
        <p>
          Todos los productos cuentan con garantía legal conforme a la normativa chilena
          y garantías del fabricante. Revisa también{" "}
          <a href="/garantias" className="text-lime-400 hover:underline">Garantías y devoluciones</a>.
        </p>

        <h2 className="text-xl font-bold text-white">5. Envíos y retiros</h2>
        <p>
          Retiro en tienda o despacho a todo Chile. Los plazos de transporte dependen de la
          empresa de envío. Más info en{" "}
          <a href="/envios" className="text-lime-400 hover:underline">Envíos y retiros</a>.
        </p>

        <h2 className="text-xl font-bold text-white">6. Soporte</h2>
        <p>
          Escríbenos a <a href="mailto:contacto@rekabyte.cl" className="text-lime-400 hover:underline">
          contacto@rekabyte.cl</a>.
        </p>
      </section>
    </main>
  );
}
