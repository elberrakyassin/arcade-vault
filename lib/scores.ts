"use client";

import { useMemo, useSyncExternalStore } from "react";
import { seededScores } from "./games";
import type { Game, GameId, LeaderboardRow, ScoreEntry } from "./types";

const SCORES_KEY = "av_scores";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string | null {
  return localStorage.getItem(SCORES_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

function notify() {
  listeners.forEach((l) => l());
}

function parseScores(raw: string | null): ScoreEntry[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function formatDate(at: number): string {
  const d = new Date(at);
  const day = String(d.getDate()).padStart(2, "0");
  const mon = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${mon}/${d.getFullYear()}`;
}

/** Puntuaciones reales guardadas, reactivas a los cambios hechos con saveScore(). */
export function useScores(): ScoreEntry[] {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => parseScores(raw), [raw]);
}

export function saveScore(entry: Omit<ScoreEntry, "at">): void {
  if (typeof window === "undefined") return;
  const all = parseScores(localStorage.getItem(SCORES_KEY));
  all.push({ ...entry, at: Date.now() });
  localStorage.setItem(SCORES_KEY, JSON.stringify(all));
  notify();
}

/** Filas semilla puras, sin depender de localStorage — deterministas. */
export function getSeedRows(id: GameId, seed: number, count: number): LeaderboardRow[] {
  return seededScores(seed, count).map((r) => ({ ...r, isReal: false }));
}

/** Combina filas semilla con las puntuaciones reales del juego, ordenadas y recortadas al top `count`. */
export function combineScores(
  seedRows: LeaderboardRow[],
  scores: ScoreEntry[],
  id: GameId,
  count: number
): LeaderboardRow[] {
  const realRows: LeaderboardRow[] = scores
    .filter((s) => s.game === id)
    .map((s) => ({ rank: 0, name: s.name, score: s.score, date: formatDate(s.at), isReal: true }));

  return [...seedRows, ...realRows]
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

/** Mejor puntuación semilla del juego, o la real guardada si es mayor. */
export function bestFromScores(game: Game, scores: ScoreEntry[]): number {
  const real = scores.filter((s) => s.game === game.id);
  return real.reduce((max, s) => Math.max(max, s.score), game.best);
}

export function userBestFromScores(
  id: GameId,
  userName: string,
  scores: ScoreEntry[]
): { name: string; score: number; date: string } | undefined {
  const real = scores.filter((s) => s.game === id && s.name === userName);
  if (real.length === 0) return undefined;
  const best = real.reduce((a, b) => (b.score > a.score ? b : a));
  return { name: best.name, score: best.score, date: formatDate(best.at) };
}
