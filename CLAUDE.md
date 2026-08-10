# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault: plataforma para jugar online y competir por puntuación. En etapa inicial (scaffold de `create-next-app` sin código de producto aún).

Sigue Spec Driven Design con los comandos `/spec` y `/spec-impl` del kit de skills `Klerith/fernando-skills` (instalable vía `npx skills@latest add Klerith/fernando-skills`). Si esos comandos existen en el proyecto, úsalos para features nuevas en vez de improvisar la implementación directamente.

## Commands

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run start` — sirve el build de producción
- `npm run lint` — ESLint (flat config en `eslint.config.mjs`, basado en `eslint-config-next`)

No hay test runner configurado todavía.

## Architecture

- Next.js **16.3.0** con App Router (`app/`), React 19.2.8. Ver la nota crítica en `AGENTS.md`: esta versión de Next.js difiere de la que conoces por entrenamiento — consulta `node_modules/next/dist/docs/` antes de usar APIs de routing, data fetching, config, etc.
- Alias de import `@/*` → raíz del proyecto (`tsconfig.json`).
- Tailwind CSS v4 vía `@tailwindcss/postcss`; no hay `tailwind.config.*` — el theming se define inline en `app/globals.css` con `@theme inline` y variables CSS (`--color-background`, `--font-sans`, etc.), con soporte a `prefers-color-scheme: dark`.
- `app/layout.tsx` carga las fuentes Geist/Geist Mono vía `next/font/google` y las expone como variables CSS.
