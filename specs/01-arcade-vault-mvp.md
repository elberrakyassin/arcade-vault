# 01 — MVP Arcade Vault

**Estado:** Implementado

**Depende de:** ninguna
**Fecha:** 2026-08-10

**Objetivo:** Implementar las 5 pantallas del MVP de Arcade Vault (Biblioteca, Detalle, Reproductor, Auth, Salón de la Fama) en Next.js App Router, con navegación por rutas reales, catálogo mock de 8 juegos, jugabilidad decorativa simulada y leaderboards reales persistidos en localStorage.

## Alcance

**Incluye:**

- 5 pantallas basadas en `references/templates/*.jsx`, adaptadas a Next.js App Router + TypeScript:
  - **Biblioteca** (`/`): grid de juegos con buscador, chips de categoría y hero.
  - **Detalle** (`/juego/[id]`): portada, sinopsis, tags, stats y leaderboard del juego.
  - **Reproductor** (`/juego/[id]/jugar`): HUD, arena CRT decorativa, partida simulada, modal de fin de partida que guarda la puntuación.
  - **Auth** (`/login`): formulario mock (iniciar sesión / crear cuenta), botón de invitado, botones sociales decorativos.
  - **Salón de la Fama** (`/salon-de-la-fama`): tabs por juego, podio top 3, tabla completa.
- Nav superior + panel móvil, y footer, compartidos en `app/layout.tsx`.
- Catálogo de 8 juegos con los datos exactos de `data.jsx` del template (ids, títulos, descripciones, categorías, portadas CSS).
- Autenticación mock (sin backend, sin verificación de contraseña) persistida en `localStorage` bajo la clave `av_user`.
- Guardado real de puntuaciones al terminar una partida, persistidas en `localStorage` bajo la clave `av_scores`.
- Leaderboards (detalle y salón) que combinan las puntuaciones reales guardadas con filas semilla (`seededScores`) de relleno, ordenadas de mayor a menor.
- Reutilización íntegra de `app/globals.css` (el theme neón/pixel ya está implementado y coincide con `styles.css` del template) — no se crean estilos nuevos salvo que falte alguna clase usada por el template y no exista aún en `globals.css`.

**No incluye (fuera de alcance del MVP):**

- Mecánica de juego real para ninguno de los 8 juegos — el "Reproductor" es una simulación decorativa (arena CSS + puntuación autoincremental aleatoria), igual que `reproductor.jsx` del template.
- Backend, base de datos o autenticación real (passwords, OAuth funcional, sesiones server-side). Los botones "Google"/"GitHub" quedan como elementos decorativos sin funcionalidad.
- Leaderboard global entre distintos jugadores/dispositivos — el guardado es local a `localStorage` del navegador, así que "competir por puntuación" es real dentro del mismo navegador, no entre usuarios distintos.
- Sistema de créditos/monedas funcional — el contador "CRÉDITOS · 03" del nav queda decorativo y estático, igual que en el template.
- Sonido, animaciones adicionales a las ya definidas en `globals.css`, PWA/offline, tests automatizados (no hay test runner configurado en el proyecto todavía).
- Multijugador real para "DUELO PIXEL" (sigue siendo simulación decorativa como el resto).

Cualquiera de estos puntos que se quiera abordar después merece su propia spec.

## Modelo de datos

Todo el estado vive en el cliente (componentes con `"use client"`); no hay servidor de datos.

```ts
// lib/types.ts
type GameId =
  | "bloque-buster" | "caida" | "serpentina" | "gloton"
  | "invasores" | "rocas" | "ranaria" | "duelo-pixel";

interface Game {
  id: GameId;
  title: string;
  short: string;
  long: string;
  cat: "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
  cover: string;   // clase CSS de portada, ya definida en globals.css (cover-bricks, cover-tetro, ...)
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;    // mejor puntuación semilla (fallback si no hay puntuaciones reales)
  plays: string;   // texto mock, ej. "12.4K"
}

interface User {
  name: string; // máx. 10 caracteres, mayúsculas
}

interface ScoreEntry {
  game: GameId;
  name: string;
  score: number;
  at: number; // Date.now() del momento en que se guardó
}

interface LeaderboardRow {
  rank: number;
  name: string;
  score: number;
  date: string; // dd/mm/aaaa
  isReal: boolean; // true si viene de av_scores, false si es fila semilla
}
```

**Persistencia en `localStorage`:**

- `av_user` → `User | null`. Se escribe al enviar el formulario de Auth; se borra al cerrar sesión. El botón "Jugar como invitado" navega a la Biblioteca sin tocar `av_user`.
- `av_scores` → `ScoreEntry[]`. Se agrega una entrada cada vez que se guarda una puntuación desde el Reproductor.

**Datos estáticos** (`lib/games.ts`, portados de `data.jsx` del template sin cambios de contenido): `GAMES` (8 juegos), `CATS`, `PLAYERS`, y la función `seededScores(seed, count)` para generar filas de relleno determinísticas.

**Combinación de leaderboard** (`lib/scores.ts`):

- `getScoresForGame(id)`: junta `seededScores(...)` con las entradas reales de `av_scores` filtradas por `game === id`, las convierte a `LeaderboardRow`, ordena por `score` descendente y reasigna `rank`.
- `getBestScore(game)`: `Math.max(game.best, mejor score real guardado para ese juego)` — usado en la Biblioteca (badge de la card) y en el Detalle (stat "Mejor global").
- `getUserBestForGame(id, userName)`: mejor entrada real del usuario actual para ese juego, o `undefined` si no tiene ninguna. Se usa para la fila "▸ TU MEJOR MARCA" del Salón de la Fama — si no existe, esa fila no se muestra (a diferencia del template, que siempre inventaba una fila ficticia).

## Plan de implementación

1. **Capa de datos y persistencia.** Crear `lib/types.ts`, `lib/games.ts` (GAMES/CATS/PLAYERS/seededScores portados de `data.jsx`), `lib/scores.ts` (lectura/escritura de `av_scores` y combinación con datos semilla), y `lib/auth-context.tsx` (`AuthProvider` + hook `useAuth` que lee/escribe `av_user` en `localStorage` y expone `{ user, login, signOut }` vía React Context, ya que en App Router cada pantalla es un archivo de ruta separado y no hay un componente raíz único como en el template para pasar props).
2. **Envolver la app.** Actualizar `app/layout.tsx` para envolver `children` en `AuthProvider` y renderizar `components/Nav.tsx` (con menú móvil hamburguesa) y `components/Footer.tsx` alrededor del contenido, tal como hace `app.jsx` en el template.
3. **Biblioteca (`app/page.tsx`).** Reescribir la página actual: hero, buscador, chips de categoría (`CATS`), grid de `GameCard` con efecto tilt, usando `getBestScore` para el badge de puntuación. Cada card navega a `/juego/[id]`.
4. **Detalle (`app/juego/[id]/page.tsx`).** Portada, tags, sinopsis, stat-strip (partidas, mejor global vía `getBestScore`, dificultad decorativa) y leaderboard vía `getScoresForGame`. Si el `id` no existe en `GAMES`, llamar a `notFound()`. Botón "Jugar ahora" → `/juego/[id]/jugar`.
5. **Reproductor (`app/juego/[id]/jugar/page.tsx`).** HUD (jugador, puntuación, vidas, nivel), arena CRT decorativa, temporizador que incrementa la puntuación simulada, pausa/reanudar, botón "Fin", y modal de fin de partida que permite editar el nombre (precargado con `user.name` o "INVITADO") y guardar la entrada en `av_scores` vía `lib/scores.ts`. Si el `id` no existe, `notFound()`.
6. **Auth (`app/login/page.tsx`).** Formulario con tabs "Iniciar sesión" / "Crear cuenta" (mock, sin validar contraseña), botón "Jugar como invitado", botones sociales decorativos sin funcionalidad. Al enviar el formulario, llama a `useAuth().login({ name })` y navega a `/`.
7. **Salón de la Fama (`app/salon-de-la-fama/page.tsx`).** Tabs por juego (uno por cada `GAMES`), podio top 3 y tabla completa vía `getScoresForGame`, más la fila "tu mejor marca" vía `getUserBestForGame` cuando aplica.
8. **Verificación manual.** Con `npm run dev`, recorrer las 5 pantallas y los flujos de los criterios de aceptación; correr `npm run lint` y `npm run build` para confirmar que no hay errores.

## Criterios de aceptación

- [ ] `/` muestra la Biblioteca con los 8 juegos de `GAMES`, buscador funcional (filtra por título) y chips de categoría funcionales (incluye "TODOS").
- [ ] Cada card de la Biblioteca navega a `/juego/[id]` y muestra la mejor puntuación (semilla o real, la que sea mayor).
- [ ] `/juego/[id]` muestra portada, sinopsis, tags, stats y un leaderboard con al menos las filas semilla; si el usuario tiene puntuaciones reales guardadas para ese juego, aparecen mezcladas y ordenadas correctamente.
- [ ] `/juego/[id]` con un id inexistente devuelve 404 (`notFound()`).
- [ ] `/juego/[id]/jugar` muestra el HUD y la arena decorativa; la puntuación sube sola mientras no está en pausa; pausa/reanudar funcionan; "Fin" abre el modal de fin de partida.
- [ ] Guardar la puntuación en el modal la persiste en `localStorage` (`av_scores`) y, al volver al Detalle o al Salón de la Fama de ese juego, la nueva puntuación aparece en la tabla si entra en el top mostrado.
- [ ] `/login` permite iniciar sesión o crear cuenta (mock) y setea el usuario visible en el Nav; "Jugar como invitado" navega a `/` sin crear sesión.
- [ ] Cerrar sesión desde el Nav borra `av_user` y el Nav vuelve a mostrar "Iniciar Sesión".
- [ ] `/salon-de-la-fama` muestra tabs por juego, podio (top 3) y tabla completa; si el usuario logueado tiene una puntuación real guardada para el juego seleccionado, se muestra la fila "tu mejor marca"; si no, esa fila no aparece.
- [ ] El Nav resalta la pestaña activa y el menú hamburguesa funciona en viewport móvil (según los breakpoints ya definidos en `globals.css`).
- [ ] Recargar la página conserva la sesión (`av_user`) y las puntuaciones guardadas (`av_scores`).
- [ ] `npm run lint` y `npm run build` terminan sin errores.

## Decisiones tomadas y descartadas

- **Rutas reales de App Router** (`/`, `/juego/[id]`, `/juego/[id]/jugar`, `/login`, `/salon-de-la-fama`) en vez del hash-routing de una sola página del template — es lo idiomático en Next.js y habilita botón atrás/URLs compartibles. Descartado: replicar el enrutamiento por hash del template.
- **Jugabilidad decorativa simulada** para los 8 juegos, igual que `reproductor.jsx` — el MVP se enfoca en el flujo completo de pantallas, no en construir 8 motores de juego reales. Descartado: implementar mecánica real (alcance excesivo para este MVP) y también la alternativa intermedia de un solo juego real de prueba.
- **Auth mock con localStorage**, sin backend — coherente con el estado inicial del proyecto (scaffold sin backend). Descartado: autenticación real con verificación de contraseña.
- **Leaderboards reales**: se combinan las puntuaciones guardadas en `av_scores` con filas semilla de relleno, en vez de ser 100% pseudo-aleatorias como en el template — para que "competir por puntuación" sea funcional de verdad en este navegador, coherente con el pitch del proyecto.
- **Catálogo de `data.jsx`** del template (ids, títulos, descripciones) en vez de los nombres provisionales que ya estaban en `app/page.tsx` (ej. "Rompeladrillos") — se descartan esos nombres provisionales.
- **`/` es la propia Biblioteca**, sin redirect intermedio a `/biblioteca`.
- **Estado de auth compartido vía React Context** (`AuthProvider`) en vez de prop-drilling — necesario porque App Router separa cada pantalla en su propio archivo de ruta, a diferencia del template donde un único componente `App` pasaba todo por props.
- **`globals.css` se reutiliza tal cual** — ya replica el theme y las clases del template (`styles.css`); no se crean estilos nuevos salvo que falte alguna clase concreta al implementar.

## Riesgos identificados

- **Competencia solo local:** sin backend compartido, cada navegador/dispositivo tiene su propio `localStorage`, así que dos jugadores en dispositivos distintos no compiten realmente entre sí todavía. Riesgo aceptado para el MVP; una spec futura puede introducir un backend/API compartido para leaderboards globales.
- **Expectativa de jugabilidad real:** como el Reproductor es decorativo, un usuario que pruebe el producto puede esperar poder jugar de verdad. Mitigación futura: una spec dedicada por juego para implementar mecánica real, una vez validado el flujo completo del MVP.
