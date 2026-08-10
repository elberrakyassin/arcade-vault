export type GameId =
  | "bloque-buster"
  | "caida"
  | "serpentina"
  | "gloton"
  | "invasores"
  | "rocas"
  | "ranaria"
  | "duelo-pixel";

export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";

export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: GameId;
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string;
  color: GameColor;
  best: number;
  plays: string;
}

export interface User {
  name: string;
}

export interface ScoreEntry {
  game: GameId;
  name: string;
  score: number;
  at: number;
}

export interface LeaderboardRow {
  rank: number;
  name: string;
  score: number;
  date: string;
  isReal: boolean;
}
