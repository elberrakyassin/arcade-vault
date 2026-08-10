const GAMES = [
  {
    cover: "cover-bricks",
    label: "ARCADE",
    title: "Rompeladrillos",
    desc: "Destruí todos los bloques antes de que se te acaben las bolas.",
    score: "128.400",
  },
  {
    cover: "cover-tetro",
    label: "PUZZLE",
    title: "Bloques Caídos",
    desc: "Encajá las piezas y limpiá líneas sin parar de bajar.",
    score: "94.200",
  },
  {
    cover: "cover-snake",
    label: "CLÁSICO",
    title: "Víbora Neón",
    desc: "Comé, crecé y no te choques con tu propia cola.",
    score: "310",
  },
  {
    cover: "cover-glot",
    label: "ARCADE",
    title: "Comelón",
    desc: "Escapá de los fantasmas y comé todos los puntos del laberinto.",
    score: "251.760",
  },
  {
    cover: "cover-invaders",
    label: "ACCIÓN",
    title: "Invasores",
    desc: "Defendé la Tierra de la invasión alienígena, oleada tras oleada.",
    score: "87.150",
  },
  {
    cover: "cover-rocas",
    label: "ACCIÓN",
    title: "Asteroides",
    desc: "Esquivá y destruí las rocas espaciales a la deriva.",
    score: "63.900",
  },
  {
    cover: "cover-rana",
    label: "CLÁSICO",
    title: "Cruce Riesgoso",
    desc: "Cruzá el río saltando de tronco en tronco sin caerte.",
    score: "540",
  },
  {
    cover: "cover-duelo",
    label: "PUZZLE",
    title: "Duelo Retro",
    desc: "El clásico duelo de paletas, ahora en HD pixelado.",
    score: "21 - 18",
  },
] as const;

const FILTERS = ["Todos", "Arcade", "Puzzle", "Acción", "Clásicos"] as const;

export default function Home() {
  return (
    <>
      <section className="av-hero">
        <h1 className="pixel">ARCADE VAULT</h1>
        <p className="sub">
          INSERTA MONEDA PARA CONTINUAR <span className="blink">█</span>
        </p>
      </section>

      <section className="av-filters">
        <div className="av-search">
          <span className="ico">⌕</span>
          <input type="text" placeholder="Buscar juego..." />
        </div>
        <div className="av-chips">
          {FILTERS.map((filter, i) => (
            <span key={filter} className={`chip${i === 0 ? " active" : ""}`}>
              {filter}
            </span>
          ))}
        </div>
      </section>

      <section className="av-grid">
        {GAMES.map((game) => (
          <article key={game.title} className="card">
            <div className="cover">
              <div className={`cover-bg ${game.cover}`} />
              <span className="label">{game.label}</span>
            </div>
            <div className="meta">
              <h2 className="title">{game.title}</h2>
              <p className="desc">{game.desc}</p>
              <div className="row">
                <div className="score-badge">
                  RÉCORD
                  <b>{game.score}</b>
                </div>
                <button className="btn" type="button">
                  Jugar
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
