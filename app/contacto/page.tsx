"use client";

import { FormEvent, useState } from "react";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaWhatsapp,
} from "react-icons/fa";

export default function ContactoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStatus(null);

    const payload = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      setStatus({
        type: "error",
        text: "Debes completar nombre, correo, asunto y mensaje.",
      });
      return;
    }

    setLoading(true);

    try {
      const resp = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok || !data?.ok) {
        setStatus({
          type: "error",
          text: data?.error ?? "No se pudo enviar el mensaje. Intenta nuevamente.",
        });
        return;
      }

      setStatus({
        type: "ok",
        text: "Tu mensaje fue enviado correctamente. Te responderemos en horario hábil.",
      });

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Error enviando formulario de contacto:", error);
      setStatus({
        type: "error",
        text: "Ocurrió un error de red. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="rb-container py-10">
      <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Contacto
      </h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 shadow-[0_10px_40px_rgba(0,0,0,.45)]">
          <ul className="space-y-5">
            <li className="flex items-start gap-3">
              <span className="mt-1 rounded-lg bg-neutral-900 p-2">
                <FaEnvelope className="text-lime-400" />
              </span>
              <div>
                <p className="text-sm text-neutral-400">Correo</p>
                <a
                  href="mailto:contacto@rekabyte.cl"
                  className="font-medium text-white hover:text-lime-300"
                >
                  contacto@rekabyte.cl
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
                  <a
                    href="tel:+56 9 7593 9292"
                    className="font-medium text-white hover:text-lime-300"
                  >
                    +56 9 7593 9292
                  </a>

                  <a
                    href="https://wa.me/56975939292"
                    target="_blank"
                    rel="noreferrer"
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
                  A pasos de Metro Lo Vial, San Miguel (dirección exacta se entrega al coordinar).
                </p>
              </div>
            </li>

            <li className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
              <p className="text-sm text-neutral-400">Horario de atención</p>
              <ul className="mt-2 text-neutral-200 text-sm leading-6">
                <li>Lunes a Viernes: Atención online durante el día</li>
                <li>Sábado: 08:00–13:00 hrs. domingos y festivos: Cerrado</li>
              </ul>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 shadow-[0_10px_40px_rgba(0,0,0,.45)]">
          <h2 className="mb-4 font-semibold text-white flex items-center gap-2">
            <FaEnvelope className="text-lime-400" /> Escríbenos
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-neutral-300" htmlFor="c-name">
                  Nombre
                </label>
                <input
                  id="c-name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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
                placeholder="Cuéntanos en qué te ayudamos..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none focus:border-lime-400"
              />
            </div>

            {status ? (
              <div
                className={[
                  "rounded-lg border px-3 py-3 text-sm",
                  status.type === "ok"
                    ? "border-lime-400/30 bg-lime-400/10 text-lime-200"
                    : "border-red-500/30 bg-red-500/10 text-red-200",
                ].join(" ")}
              >
                {status.text}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className={[
                "w-full rounded-lg px-4 py-2 font-semibold transition",
                loading
                  ? "cursor-wait bg-lime-300/70 text-neutral-800"
                  : "bg-lime-400 text-neutral-900 hover:brightness-110",
              ].join(" ")}
            >
              {loading ? "Enviando..." : "Enviar mensaje"}
            </button>

            <p className="text-xs text-neutral-500">
              Responderemos por correo o WhatsApp en horario hábil.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}