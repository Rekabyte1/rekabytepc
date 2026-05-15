import GuideLanding from "@/components/GuideLanding";

export default function Page() {
  return (
    <GuideLanding
      kicker="Guía RekaByte"
      title="Mouse liviano vs mouse tradicional: cuál elegir según tu forma de jugar"
      subtitle="El peso del mouse cambia la fatiga, el control y la velocidad de ajuste. No existe un ganador universal: depende de tu grip, sensibilidad y tipo de juego."
      heroImage="/banners/mouse.jpg"
      sections={[
        {
          title: "Ventaja del mouse liviano",
          text: "Facilita flicks, correcciones rápidas y sesiones largas con menos cansancio. Suele beneficiar a jugadores de sensibilidad media-baja que mueven más brazo.",
        },
        {
          title: "Ventaja del mouse tradicional",
          text: "Puede sentirse más estable en tracking continuo y movimientos finos. Muchos usuarios lo prefieren cuando priorizan consistencia sobre velocidad máxima.",
        },
        {
          title: "Factores más importantes que el peso",
          text: "Forma, sensor, calidad de switches, skates y tamaño de tu mano pesan tanto como los gramos. Un mouse liviano incómodo rinde peor que uno más pesado bien adaptado.",
        },
        {
          title: "Cómo decidir sin equivocarte",
          text: "Revisa tu historial: si te fatigas o te cuesta corregir rápido, prueba más liviano. Si sobrecorriges o pierdes estabilidad, quizá te conviene un peso intermedio.",
        },
      ]}
      compareTitle="Comparativa práctica"
      compare={[
        { label: "Flick y microajuste", value: "Liviano: más veloz. Tradicional: más inercia y control percibido." },
        { label: "Fatiga", value: "Liviano: suele reducir cansancio en sesiones largas." },
        { label: "Estabilidad", value: "Tradicional puede sentirse más asentado para algunos grips." },
        { label: "Perfil ideal", value: "Liviano para dinámica rápida; tradicional para control más estable." },
      ]}
      highlights={[
        "No elijas por moda: el fit ergonómico manda.",
        "Si cambias de peso, da tiempo a la adaptación muscular.",
        "Un buen mousepad amplifica la mejora del mouse correcto.",
        "Peso + forma + sensor es la combinación que importa.",
      ]}
    />
  );
}