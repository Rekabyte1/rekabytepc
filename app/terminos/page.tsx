// app/terminos/page.tsx
export const metadata = {
  title: "Términos y condiciones | RekaByte",
  description:
    "Términos y condiciones de compra en RekaByte SpA: procesos, pagos, stock, despacho, retiro, cambios y garantías.",
};

export default function TerminosPage() {
  const updated = new Date().toLocaleDateString("es-CL");

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-extrabold text-white">
        Términos y condiciones
      </h1>
      <p className="text-sm text-neutral-400">Última actualización: {updated}</p>

      <p className="mt-6 text-neutral-300">
        Estos términos regulan la compra de productos y servicios ofrecidos por{" "}
        <span className="font-semibold text-white">RekaByte SpA</span> (en adelante,
        “RekaByte”) a través de este sitio. Al realizar un pedido, aceptas estas
        condiciones.
      </p>

      <div className="mt-8 space-y-6 text-neutral-300">
        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">1. Información general</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Las ventas se procesan en CLP.</li>
            <li>
              RekaByte puede emitir boleta o factura según corresponda a tu compra.
            </li>
            <li>
              Nos reservamos el derecho de rechazar o anular pedidos ante fraude,
              inconsistencias evidentes o problemas operativos (por ejemplo, stock
              imposible de cumplir).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">2. Precios y pagos</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Los precios pueden variar sin previo aviso. El precio válido es el
              confirmado en el pedido al momento de la compra.
            </li>
            <li>
              Medios de pago disponibles:{" "}
              <span className="font-semibold text-white">transferencia</span> y{" "}
              <span className="font-semibold text-white">
                tarjeta (Webpay / Mercado Pago)
              </span>{" "}
              cuando esté habilitado.
            </li>
            <li>
              En pagos con tarjeta, la confirmación puede depender de la aprobación del
              proveedor de pagos.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">3. Stock, armado y preparación</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              El stock se confirma al momento de procesar el pedido. En caso de
              inconsistencias, te contactaremos para resolver (cambio, espera o
              cancelación).
            </li>
            <li>
              {" "}
              <span className="font-semibold text-white">
                equipos armados listos (entrega inmediata)
              </span>
              . Sin perjuicio de lo anterior, un pedido puede requerir preparación
              adicional (validación, pruebas, embalaje).
            </li>
            <li>
              Los equipos pueden pasar por control de calidad y pruebas antes de ser
              entregados o despachados.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">4. Envíos y retiros</h2>
          <p>
            Los despachos se realizan mediante{" "}
            <span className="font-semibold text-white">Chilexpress</span> y el retiro
            se coordina una vez procesado el pedido. Revisa el detalle en{" "}
            <a href="/envios" className="text-lime-400 hover:underline">
              Envíos y retiros
            </a>
            .
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              El costo de envío{" "}
              <span className="font-semibold text-white">se paga aparte</span> y se
              informa/coordina una vez procesado el pedido (según destino y tamaño del
              paquete).
            </li>
            <li>
              Es responsabilidad del cliente ingresar correctamente sus datos de contacto
              y destino. Costos por reexpedición/devolución por datos erróneos corren por
              cuenta del cliente.
            </li>
            <li>
              Te recomendamos revisar el paquete al recibirlo. Si detectas daño externo,
              deja constancia con el transportista al momento de la entrega.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">5. Cambios, upgrades y modificaciones</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Puedes realizar cambios/upgrades en tu equipo siempre que{" "}
              <span className="font-semibold text-white">
                no afecten el funcionamiento
              </span>{" "}
              ni generen riesgos eléctricos/mecánicos (por ejemplo: ampliación de RAM o
              almacenamiento compatible).
            </li>
            <li>
              Si luego de un upgrade/modificación el equipo presenta fallas y se determina
              que el problema está relacionado al cambio realizado,{" "}
              <span className="font-semibold text-white">
                RekaByte no se hace responsable
              </span>{" "}
              por esa falla.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">6. Garantías y devoluciones</h2>
          <p>
            La garantía para comenzar es de{" "}
            <span className="font-semibold text-white">6 meses</span> y cubre{" "}
            <span className="font-semibold text-white">
              exclusivamente fallas por componente defectuoso de fábrica
            </span>{" "}
            (según evaluación técnica). El proceso completo está en{" "}
            <a href="/garantias" className="text-lime-400 hover:underline">
              Garantías y devoluciones
            </a>
            .
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              En caso de garantía/RMA, el{" "}
              <span className="font-semibold text-white">
                cliente paga el envío hacia RekaByte y RekaByte cubre el envío de regreso
              </span>{" "}
              cuando corresponda por garantía.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">7. Soporte y contacto</h2>
          <p>
            Para soporte, dudas o coordinación de retiro/despacho escríbenos a{" "}
            <a className="text-lime-400 hover:underline" href="mailto:contacto@rekabyte.cl">
              contacto@rekabyte.cl
            </a>{" "}
            o por WhatsApp.
          </p>
        </section>
      </div>
    </main>
  );
}
