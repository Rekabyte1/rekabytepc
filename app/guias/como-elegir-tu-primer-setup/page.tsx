import GuideLanding from "@/components/GuideLanding";

export default function Page() {
  return (
    <GuideLanding
      kicker="Guía RekaByte"
      title="Cómo elegir tu primer setup gamer sin gastar de más"
      subtitle="El mejor primer setup no es el más caro: es el más equilibrado para tu tipo de juego, tu espacio y tu presupuesto. Prioriza piezas que impactan directamente la experiencia diaria."
      heroImage="/banners/banner-1.jpg"
      sections={[
        {
          title: "Empieza por lo que más usas",
          text: "En la mayoría de casos: mouse, teclado y mousepad. Son el punto de contacto directo con tu rendimiento. Después vienen audio y cámara según necesidad.",
        },
        {
          title: "Define tu nivel de entrada",
          text: "Spawn: funcional y confiable. Loadout: balance entre rendimiento y comodidad. Clutch: foco competitivo con ajustes más finos y menor tolerancia a latencia.",
        },
        {
          title: "Evita errores típicos",
          text: "No compres por estética primero, ni mezcles periféricos sin revisar compatibilidad de tamaño, grip o software. Un setup coherente rinde más que piezas aisladas top.",
        },
        {
          title: "Checklist rápido antes de comprar",
          text: "¿Tu mouse combina con tu sensibilidad? ¿El teclado se adapta a tu espacio? ¿El mousepad tiene tamaño suficiente? ¿El audio sirve para tu entorno real?",
        },
      ]}
      compareTitle="Prioridad recomendada de inversión"
      compare={[
        { label: "Prioridad 1", value: "Mouse + mousepad: base de control y precisión." },
        { label: "Prioridad 2", value: "Teclado: consistencia de input y comodidad de uso." },
        { label: "Prioridad 3", value: "Audio: información espacial y comunicación." },
        { label: "Prioridad 4", value: "Streaming/accesorios: cuando el núcleo ya está sólido." },
      ]}
      highlights={[
        "Menos piezas, mejor elegidas, suele dar mejor resultado.",
        "El setup ideal evoluciona por etapas, no de golpe.",
        "Define primero problema real: fatiga, precisión, comodidad o latencia.",
        "Compra con criterio técnico y luego optimiza estética.",
      ]}
    />
  );
}