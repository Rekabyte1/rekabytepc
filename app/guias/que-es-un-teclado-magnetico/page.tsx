import GuideLanding from "@/components/GuideLanding";

export default function Page() {
  return (
    <GuideLanding
      kicker="Guía RekaByte"
      title="¿Qué es un teclado magnético y por qué está cambiando el juego competitivo?"
      subtitle="Un teclado magnético usa sensores Hall Effect para detectar la posición real de cada tecla. Eso permite ajustar el punto de activación y obtener una respuesta más consistente que en un switch mecánico tradicional."
      heroImage="/banners/teclados.jpg"
      sections={[
        {
          title: "Cómo funciona",
          text: "En vez de depender de un contacto físico fijo, el sensor mide el campo magnético del switch. Así, la tecla se registra por distancia recorrida y no por un único punto mecánico.",
        },
        {
          title: "Qué mejora en uso real",
          text: "La ventaja principal es el control: puedes configurar una activación corta para respuesta rápida o más profunda para evitar pulsaciones accidentales. Esto se nota sobre todo en strafes, microajustes y acciones repetidas.",
        },
        {
          title: "Cuándo vale la pena",
          text: "Si juegas FPS tácticos, rhythm games o títulos donde el timing importa, sí hay diferencia. Si solo usas el teclado para oficina o juego casual, la mejora existe pero no siempre justifica el salto de precio.",
        },
        {
          title: "Qué mirar antes de comprar",
          text: "Busca estabilidad de firmware, opciones de software claras, calidad de construcción y keycaps. Un buen teclado magnético no es solo sensor: también importa la experiencia de escritura y la durabilidad.",
        },
      ]}
      compareTitle="Magnético vs mecánico tradicional"
      compare={[
        { label: "Detección", value: "Magnético: por distancia (analógica). Mecánico: punto fijo de contacto." },
        { label: "Personalización", value: "Magnético: activación ajustable por tecla. Mecánico: depende del switch instalado." },
        { label: "Consistencia", value: "Magnético: muy estable en sesiones largas. Mecánico: excelente, pero más dependiente del switch." },
        { label: "Perfil ideal", value: "Competitivo y entusiasta que quiere controlar cada detalle." },
      ]}
      highlights={[
        "Activación configurable según juego y rol.",
        "Mayor control en movimientos cortos y repetidos.",
        "Buena base para funciones avanzadas como Rapid Trigger.",
        "No reemplaza habilidad, pero reduce fricción técnica.",
      ]}
    />
  );
}