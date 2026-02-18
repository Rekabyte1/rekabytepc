"use client";

import Link from "next/link";

type Props = {
  onNavigate?: () => void;
};

const GAME_LINKS = [
  { label: "Counter-Strike 2", slug: "counter-strike-2" },
  { label: "Call of Duty: Warzone", slug: "call-of-duty-warzone" },
  { label: "Minecraft", slug: "minecraft" },
];

export default function GamesMegaMenu({ onNavigate }: Props) {
  function handleClick() {
    if (onNavigate) onNavigate();
  }

  return (
    <div className="rb-mega-panel">
      <div className="rb-mega-grid">

        <div className="col">
          <h4>Gama de modelos</h4>
          <ul>
            <li><Link href="/modelos" onClick={handleClick}>Todos los modelos</Link></li>
            <li><Link href="/modelos/stock" onClick={handleClick}>En stock</Link></li>
            <li><Link href="/modelos/configurador" onClick={handleClick}>Configurador</Link></li>
          </ul>
        </div>

        <div className="col">
          <h4>Seleccionar por tareas</h4>
          <ul>
            <li><Link href="/tareas/trabajar-y-estudiar" onClick={handleClick}>Trabajar y estudiar</Link></li>
            <li><Link href="/tareas/streaming" onClick={handleClick}>Streaming</Link></li>
            <li><Link href="/tareas/juegos-2k" onClick={handleClick}>Juegos en 2K</Link></li>
          </ul>
        </div>

        <div className="col">
          <h4>Seleccionar por juego</h4>
          <ul>
            {GAME_LINKS.map((g) => (
              <li key={g.slug}>
                <Link href={`/juegos/${g.slug}`} onClick={handleClick}>
                  {g.label}
                </Link>
              </li>
            ))}
            <li><Link href="/allgames" onClick={handleClick}>Ver todos los juegos</Link></li>
          </ul>
        </div>

        <div className="col">
          <h4>Seleccionar por procesador</h4>
          <ul>
            <li><Link href="/procesador/intel" onClick={handleClick}>Intel</Link></li>
            <li><Link href="/procesador/amd-ryzen" onClick={handleClick}>AMD Ryzen</Link></li>
          </ul>
        </div>

        <div className="col">
          <h4>Seleccionar por tarjeta de video</h4>
          <ul>
            <li><Link href="/gpu/geforce-rtx-5060-ti" onClick={handleClick}>GeForce RTX 5060/Ti</Link></li>
            <li><Link href="/gpu/geforce-rtx-5070-ti" onClick={handleClick}>GeForce RTX 5070/Ti</Link></li>
            <li><Link href="/gpu/geforce-rtx-5080" onClick={handleClick}>GeForce RTX 5080</Link></li>
            <li><Link href="/gpu/geforce-rtx-5090" onClick={handleClick}>GeForce RTX 5090</Link></li>
          </ul>
        </div>

      </div>

      <div className="rb-mega-accent" />
    </div>
  );
}
