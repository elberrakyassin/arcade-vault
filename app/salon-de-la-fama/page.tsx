"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GAMES } from "@/lib/games";
import { useAuth } from "@/lib/auth-context";
import { combineScores, getSeedRows, useScores, userBestFromScores } from "@/lib/scores";
import type { GameId } from "@/lib/types";

export default function SalonDeLaFamaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<GameId>(GAMES[0].id);
  const seed = tab.length * 23 + 7;
  const realScores = useScores();

  const game = useMemo(() => GAMES.find((g) => g.id === tab)!, [tab]);
  const rows = useMemo(
    () => combineScores(getSeedRows(tab, seed, 12), realScores, tab, 12),
    [tab, seed, realScores]
  );
  const youBest = useMemo(
    () => (user ? userBestFromScores(tab, user.name, realScores) : undefined),
    [tab, user, realScores]
  );

  const youRankRow = youBest
    ? rows.find((r) => r.isReal && r.name === youBest.name && r.score === youBest.score)
    : undefined;

  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel" style={{ fontSize: 10 }}>
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </div>

      <div className="hall-tabs">
        {GAMES.map((g) => (
          <button key={g.id} className={"chip" + (tab === g.id ? " active" : "")} onClick={() => setTab(g.id)}>
            {g.title}
          </button>
        ))}
      </div>

      <div className="podium">
        <div className="podium-slot silver">
          <div className="rank-num">02</div>
          <div className="name">{rows[1].name}</div>
          <div className="score">{rows[1].score.toLocaleString("es-ES")}</div>
          <div className="date">{rows[1].date}</div>
        </div>
        <div className="podium-slot gold">
          <div className="pixel" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em" }}>
            CAMPEÓN
          </div>
          <div className="rank-num" style={{ fontSize: 36, marginTop: 4 }}>
            01
          </div>
          <div className="name">{rows[0].name}</div>
          <div className="score" style={{ fontSize: 20 }}>
            {rows[0].score.toLocaleString("es-ES")}
          </div>
          <div className="date">{rows[0].date}</div>
        </div>
        <div className="podium-slot bronze">
          <div className="rank-num">03</div>
          <div className="name">{rows[2].name}</div>
          <div className="score">{rows[2].score.toLocaleString("es-ES")}</div>
          <div className="date">{rows[2].date}</div>
        </div>
      </div>

      <div className="hall-table">
        <div className="th">
          <div>RANGO</div>
          <div>JUGADOR</div>
          <div>PUNTUACIÓN</div>
          <div>FECHA</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={`${r.name}-${i}`}
            className={"tr" + (i === 0 ? " top1" : i === 1 ? " top2" : i === 2 ? " top3" : "")}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
            <div className="pl">{r.name}</div>
            <div className="sc">{r.score.toLocaleString("es-ES")}</div>
            <div className="dt">{r.date}</div>
          </div>
        ))}
        {youBest && (
          <>
            <div className="tr you-label">▸ TU MEJOR MARCA EN {game.title}</div>
            <div className="tr you" style={{ animationDelay: `${rows.length * 50 + 50}ms` }}>
              <div className="rk" style={{ color: "var(--yellow)" }}>
                {youRankRow ? `#${String(youRankRow.rank).padStart(2, "0")}` : "—"}
              </div>
              <div className="pl" style={{ color: "var(--yellow)" }}>
                {youBest.name}
              </div>
              <div className="sc" style={{ color: "var(--yellow)", textShadow: "0 0 6px rgba(245,255,0,0.5)" }}>
                {youBest.score.toLocaleString("es-ES")}
              </div>
              <div className="dt">{youBest.date}</div>
            </div>
          </>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button className="btn lg" onClick={() => router.push("/")}>
          VOLVER A LA BIBLIOTECA
        </button>
      </div>
    </div>
  );
}
