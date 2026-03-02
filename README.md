# AceYourInterview

Premium bilingual interview-prep platform built with Next.js, Tailwind, Framer Motion, and Firebase.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Firebase Setup (3 steps)

1. Copy env template:
```bash
cp .env.example .env.local
```

2. Fill all `NEXT_PUBLIC_FIREBASE_*` values in `.env.local` from your Firebase project settings, including `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` if you want Analytics enabled.

3. Add admin emails in `NEXT_PUBLIC_ADMIN_ALLOWLIST` (comma-separated) to access `/admin`.

## AI-Assisted Admin Parsing

To use the single-input AI parser in the admin create flow, also add:

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_ADMIN_PARSER_MODEL=gpt-4o-mini
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_ADMIN_PARSER_MODEL=claude-3-5-sonnet-latest
GEMINI_API_KEY=your_gemini_api_key
GEMINI_ADMIN_PARSER_MODEL=gemini-1.5-pro
ADMIN_ALLOWLIST=admin@example.com
```

- `ADMIN_ALLOWLIST` is optional. If omitted, the server parser route falls back to `NEXT_PUBLIC_ADMIN_ALLOWLIST`.
- The admin create form lets you choose `OpenAI`, `Claude`, or `Gemini` before parsing. Only the provider you choose needs its matching API key configured.
- The parser never saves the raw mixed input directly. It only returns a structured draft for review before the question is saved.

## Demo Mode behavior

If Firebase is missing, invalid, or temporarily unavailable, the homepage automatically switches to **Demo Mode**:
- Renders polished sample interview cards.
- Keeps search/language toggle/reveal animations working.
- Avoids raw Firebase error dumps in the UI.

Once Firebase config is valid, the app automatically uses real Firestore data.

## Build and lint

```bash
npm run lint
npm run build
```
