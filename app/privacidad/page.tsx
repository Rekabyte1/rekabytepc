// app/privacidad/page.tsx
export const metadata = {
  title: "Política de privacidad | RekaByte",
  description:
    "Política de privacidad de RekaByte SpA: datos personales, finalidades, almacenamiento, seguridad y derechos del usuario.",
};

function updatedCL() {
  return new Date().toLocaleDateString("es-CL");
}

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-extrabold text-white">
        Política de privacidad
      </h1>
      <p className="text-sm text-neutral-400">Última actualización: {updatedCL()}</p>

      <p className="mt-6 text-neutral-300">
        Esta Política describe cómo{" "}
        <span className="font-semibold text-white">RekaByte SpA</span> (“RekaByte”)
        recopila, usa y protege tus datos personales cuando navegas o compras en
        nuestro sitio.
      </p>

      <div className="mt-8 space-y-6 text-neutral-300">
        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">1. Datos que recopilamos</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-semibold text-white">Datos de contacto:</span>{" "}
              nombre, correo, teléfono.
            </li>
            <li>
              <span className="font-semibold text-white">Datos de compra:</span>{" "}
              productos, cantidades, monto, medio de pago seleccionado y estado del pedido.
            </li>
            <li>
              <span className="font-semibold text-white">Datos de despacho (si aplica):</span>{" "}
              dirección, comuna/ciudad, región y observaciones de entrega.
            </li>
            <li>
              <span className="font-semibold text-white">Soporte:</span>{" "}
              mensajes que nos envías por correo o WhatsApp y la información necesaria para ayudarte.
            </li>
            <li>
              <span className="font-semibold text-white">Datos técnicos básicos:</span>{" "}
              información de navegación necesaria para operar y asegurar el sitio (por ejemplo, logs de servidor).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">2. Para qué usamos tus datos</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Procesar pedidos, coordinar retiro o despacho y entregar información de seguimiento.</li>
            <li>Contactarte ante dudas del pedido, validaciones o actualizaciones relevantes.</li>
            <li>Emitir comunicaciones transaccionales (confirmación de pedido, cambios de estado, etc.).</li>
            <li>Soporte postventa y gestión de garantía/RMA cuando corresponda.</li>
            <li>Mejorar seguridad del sitio, prevenir fraudes y resolver incidencias técnicas.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">3. Base de comunicación</h2>
          <p>
            Te contactaremos principalmente por{" "}
            <span className="font-semibold text-white">correo</span> y, si corresponde,
            por <span className="font-semibold text-white">WhatsApp/teléfono</span> para
            coordinación de entrega, validaciones y soporte.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">4. Con quién compartimos tus datos</h2>
          <p>
            No vendemos tus datos. Compartimos solo lo necesario para operar la venta:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-semibold text-white">Chilexpress:</span>{" "}
              datos mínimos para generar y transportar el envío (nombre, teléfono y dirección de entrega si aplica).
            </li>
            <li>
              <span className="font-semibold text-white">Proveedores de pago:</span>{" "}
              cuando pagues con tarjeta (Webpay/Mercado Pago u otro), el procesamiento lo realiza el proveedor.
              RekaByte no almacena datos sensibles de tu tarjeta.
            </li>
            <li>
              <span className="font-semibold text-white">Plataforma técnica:</span>{" "}
              servicios necesarios para operar el sitio, base de datos, hosting y envío de correos transaccionales.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">5. Almacenamiento y seguridad</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Aplicamos medidas razonables de seguridad para proteger tus datos frente a acceso no autorizado,
              uso indebido o pérdida.
            </li>
            <li>
              Aun así, ningún sistema es 100% infalible. Si detectas algo extraño, contáctanos de inmediato.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">6. Conservación de datos</h2>
          <p>
            Conservamos tus datos el tiempo necesario para cumplir con la finalidad de la compra,
            soporte postventa, garantías y obligaciones operativas/administrativas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">7. Derechos del usuario</h2>
          <p>
            Puedes solicitar acceso, rectificación o eliminación de tus datos cuando corresponda,
            y también hacer consultas sobre su tratamiento.
          </p>
          <p>
            Para ejercer estos derechos, escríbenos a{" "}
            <a
              className="text-lime-400 hover:underline"
              href="mailto:contacto@rekabyte.cl"
            >
              contacto@rekabyte.cl
            </a>{" "}
            indicando tu nombre y el correo usado en tu compra.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">8. Cambios a esta política</h2>
          <p>
            Podemos actualizar esta Política para reflejar mejoras o cambios operativos.
            La versión vigente siempre estará publicada en esta página.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">9. Contacto</h2>
          <p>
            Si tienes dudas sobre privacidad, contáctanos en{" "}
            <a
              className="text-lime-400 hover:underline"
              href="mailto:contacto@rekabyte.cl"
            >
              contacto@rekabyte.cl
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
