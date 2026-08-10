"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { User } from "./types";

const USER_KEY = "av_user";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string | null {
  return localStorage.getItem(USER_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

function notify() {
  listeners.forEach((l) => l());
}

function parseUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

interface AuthContextValue {
  user: User | null;
  login: (user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const user = useMemo(() => parseUser(raw), [raw]);

  const login = (u: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    notify();
  };

  const signOut = () => {
    localStorage.removeItem(USER_KEY);
    notify();
  };

  return <AuthContext.Provider value={{ user, login, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
