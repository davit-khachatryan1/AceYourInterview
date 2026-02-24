# AGENTS.md

## Cursor Cloud specific instructions

### Overview

"Ace Your Interview" is a Next.js 16 (App Router) single-page application for interview preparation flashcards. It uses Firebase (Firestore + Auth) as a BaaS backend — there is no local database or backend server.

### Running the app

- **Dev server**: `npm run dev` (serves on `http://localhost:3000`)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (ESLint 4.x — the installed version is old and does not pick up the flat config in `eslint.config.mjs`; lint runs but only prints help without file arguments)

### Key caveats

- **`npm install --legacy-peer-deps` is required** due to peer dependency conflicts between `eslint@^4.0.0` and `eslint-config-next@^12.0.4`. Standard `npm install` will fail with `ERESOLVE`.
- **Firebase config is placeholder**: `src/lib/firebaseConfig.ts` contains `YOUR_API_KEY` etc. The app starts and renders but cannot fetch data or authenticate without real Firebase credentials. This is expected for local dev without a Firebase project configured.
- **No test framework** is configured (no Jest, Vitest, Playwright, or Cypress).
- **No CI/CD** configuration exists.
- The project uses Tailwind CSS 4 via `@tailwindcss/postcss`.
