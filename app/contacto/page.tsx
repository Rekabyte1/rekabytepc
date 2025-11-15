// app/contacto/page.tsx
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";

export default function ContactoPage() {
  return (
    <main className="rb-container py-10">
      <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Contacto
      </h1>

      {/* Info + Form */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Columna izquierda: información */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 shadow-[0_10px_40px_rgba(0,0,0,.45)]">
          <ul className="space-y-5">
            <li className="flex items-start gap-3">
              <span className="mt-1 rounded-lg bg-neutral-900 p-2">
                <FaEnvelope className="text-lime-400" />
              </span>
              <div>
                <p className="text-sm text-neutral-400">Correo</p>
                <a
                  href="mailto:rekabytepc@gmail.com"
                  className="font-medium text-white hover:text-lime-300"
                >
                  rekabytepc@gmail.com
                </a>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-1 rounded-lg bg-neutral-900 p-2">
                <FaPhoneAlt className="text-lime-400" />
              </span>
              <div>
                <p className="text-sm text-neutral-400">Teléfono / WhatsApp</p>
                <div className="flex flex-wrap items-center gap-3">
                  <a href="tel:+56912345678" className="font-medium text-white hover:text-lime-300">
                    +56 9 1234 5678
                  </a>
                  <a
                    href="https://wa.me/56912345678"
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-neutral-900 px-3 py-1 text-lime-400 hover:bg-neutral-900/70"
                  >
                    <FaWhatsapp /> Escríbenos por WhatsApp
                  </a>
                </div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-1 rounded-lg bg-neutral-900 p-2">
                <FaMapMarkerAlt className="text-lime-400" />
              </span>
              <div>
                <p className="text-sm text-neutral-400">Punto de retiro</p>
                <p className="font-medium text-white">
                  Real Audiencia 1170, San Miguel
                </p>
                <a
                  href="https://maps.google.com/?q=Real Audiencia 1170, San Miguel"
                  target="_blank"
                  className="mt-1 inline-block text-lime-400 hover:text-lime-300 underline underline-offset-2"
                >
                  Abrir en Google Maps
                </a>
              </div>
            </li>

            <li className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
              <p className="text-sm text-neutral-400">Horario de atención</p>
              <ul className="mt-2 text-neutral-200 text-sm leading-6">
                <li>Lunes a Viernes: 10:00 – 19:00</li>
                <li>Sábado: 10:00 – 14:00</li>
                <li>Domingos y festivos: Cerrado</li>
              </ul>
            </li>
          </ul>
        </section>

        {/* Columna derecha: formulario */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 shadow-[0_10px_40px_rgba(0,0,0,.45)]">
          <h2 className="mb-4 font-semibold text-white flex items-center gap-2">
            <FaEnvelope className="text-lime-400" /> Escríbenos
          </h2>

          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-neutral-300" htmlFor="c-name">
                  Nombre
                </label>
                <input
                  id="c-name"
                  type="text"
                  placeholder="Tu nombre"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-neutral-300" htmlFor="c-email">
                  Correo
                </label>
                <input
                  id="c-email"
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none focus:border-lime-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-neutral-300" htmlFor="c-subject">
                Asunto
              </label>
              <input
                id="c-subject"
                type="text"
                placeholder="¿Sobre qué trata?"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none focus:border-lime-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-neutral-300" htmlFor="c-msg">
                Mensaje
              </label>
              <textarea
                id="c-msg"
                rows={5}
                placeholder="Cuéntanos en qué te ayudamos…"
                className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none focus:border-lime-400"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-lime-400 px-4 py-2 font-semibold text-neutral-900 hover:brightness-110"
            >
              Enviar mensaje
            </button>
          </form>
        </section>
      </div>

      {/* Mapa responsive */}
      <section className="mt-8 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/70 shadow-[0_10px_40px_rgba(0,0,0,.45)]">
        <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
          <iframe
            title="Mapa Rekabyte"
            src="https://www.google.com/maps?q=Real%20Audiencia%201170,%20San%20Miguel&output=embed"
            className="absolute inset-0 h-full w-full"
            loading="lazy"
          />
        </div>
      </section>
    </main>
  );
}
