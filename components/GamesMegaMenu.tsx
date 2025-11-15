"use client";

import Link from "next/link";

// Juegos que ya tienes (o irás agregando)
const GAME_LINKS = [
  { label: "Counter-Strike 2", slug: "counter-strike-2" },
  { label: "Call of Duty: Warzone", slug: "call-of-duty-warzone" },
  { label: "Minecraft", slug: "minecraft" },
];

export default function GamesMegaMenu() {
  return (
    <div className="rb-mega-panel">
      <div className="rb-mega-grid">
        {/* Gama de modelos */}
        <div className="col">
          <h4>Gama de modelos</h4>
          <ul>
            <li><Link href="/modelos">Todos los modelos</Link></li>
            <li><Link href="/modelos/stock">En stock</Link></li>
            <li><Link href="/modelos/configurador">Configurador</Link></li>
          </ul>
        </div>

        {/* Seleccionar por tareas */}
        <div className="col">
          <h4>Seleccionar por tareas</h4>
          <ul>
            <li><Link href="/tareas/trabajar-y-estudiar">Trabajar y estudiar</Link></li>
            <li><Link href="/tareas/streaming">Streaming</Link></li>
            <li><Link href="/tareas/juegos-2k">Juegos en 2K</Link></li>
          </ul>
        </div>

        {/* Seleccionar por juego */}
        <div className="col">
          <h4>Seleccionar por juego</h4>
          <ul>
            {GAME_LINKS.map((g) => (
              <li key={g.slug}>
                <Link href={`/juegos/${g.slug}`}>{g.label}</Link>
              </li>
            ))}
            {/* <- tu índice de “Todos los juegos” con la ruta pedida */}
            <li><Link href="/allgames">Ver todos los juegos</Link></li>
          </ul>
        </div>

        {/* Seleccionar por procesador */}
        <div className="col">
          <h4>Seleccionar por procesador</h4>
          <ul>
            <li><Link href="/procesador/intel">Intel</Link></li>
            <li><Link href="/procesador/amd-ryzen">AMD Ryzen</Link></li>
          </ul>
        </div>

        {/* Seleccionar por tarjeta de video */}
        <div className="col">
          <h4>Seleccionar por tarjeta de video</h4>
          <ul>
            <li><Link href="/gpu/geforce-rtx-5060-ti">GeForce RTX 5060/Ti</Link></li>
            <li><Link href="/gpu/geforce-rtx-5070-ti">GeForce RTX 5070/Ti</Link></li>
            <li><Link href="/gpu/geforce-rtx-5080">GeForce RTX 5080</Link></li>
            <li><Link href="/gpu/geforce-rtx-5090">GeForce RTX 5090</Link></li>
          </ul>
        </div>
      </div>

      <div className="rb-mega-accent" />
    </div>
  );
}
