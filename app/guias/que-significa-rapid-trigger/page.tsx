import GuideLanding from "@/components/GuideLanding";

export default function Page() {
  return (
    <GuideLanding
      kicker="Guía RekaByte"
      title="¿Qué significa Rapid Trigger y por qué importa tanto en FPS?"
      subtitle="Rapid Trigger permite que una tecla se desactive apenas empieza a subir, sin esperar un punto de reset fijo. Eso hace más ágiles los cambios de dirección y reduce la sensación de 'tecla pegada'."
      heroImage="/banners/perifericos.jpg"
      sections={[
        {
          title: "La diferencia técnica real",
          text: "En teclados normales, la tecla activa y resetea en puntos definidos. Con Rapid Trigger, la activación y desactivación se recalculan dinámicamente según el movimiento de la tecla.",
        },
        {
          title: "Dónde se nota",
          text: "En FPS como Valorant o CS2 se percibe en counter-strafes, jiggle peeks y correcciones rápidas. También ayuda en juegos con cambios bruscos de ritmo donde un reset lento penaliza.",
        },
        {
          title: "Configuración recomendada",
          text: "Empieza conservador: sensibilidad media y solo en teclas de movimiento. Si lo dejas demasiado agresivo desde el inicio, puedes perder estabilidad hasta acostumbrarte.",
        },
        {
          title: "Qué no hace",
          text: "No mejora aim por sí solo ni compensa mala técnica. Es una herramienta de control: funciona mejor cuando ya tienes fundamentos sólidos de movimiento y timing.",
        },
      ]}
      compareTitle="Con y sin Rapid Trigger"
      compare={[
        { label: "Reset de tecla", value: "Sin RT: reset fijo. Con RT: reset dinámico casi inmediato." },
        { label: "Sensación", value: "Sin RT: más tradicional. Con RT: más reactiva y precisa en microacciones." },
        { label: "Curva de adaptación", value: "Con RT suele requerir unos días para evitar sobrecorrecciones." },
        { label: "Mejor uso", value: "Teclas WASD, con ajustes progresivos por perfil de juego." },
      ]}
      highlights={[
        "Reduce retraso al soltar y volver a presionar.",
        "Mejora control de movimiento en escenarios tensos.",
        "Conviene ajustarlo por juego, no copiar configuración ajena.",
        "La mejor ganancia viene de combinar hardware + práctica.",
      ]}
    />
  );
}