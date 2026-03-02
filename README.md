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

2. Fill all `NEXT_PUBLIC_FIREBASE_*` values from your Firebase project settings.

3. Add admin emails in `NEXT_PUBLIC_ADMIN_ALLOWLIST` (comma-separated) to access `/admin`.

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
