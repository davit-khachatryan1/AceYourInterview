const placeholders = new Set([
  'YOUR_API_KEY',
  'YOUR_AUTH_DOMAIN',
  'YOUR_PROJECT_ID',
  'YOUR_STORAGE_BUCKET',
  'YOUR_MESSAGING_SENDER_ID',
  'YOUR_APP_ID',
]);

const readEnv = (key: string, fallback: string): string => {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value : fallback;
};

export const firebaseConfig = {
  apiKey: readEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'YOUR_API_KEY'),
  authDomain: readEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'YOUR_AUTH_DOMAIN'),
  projectId: readEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'YOUR_PROJECT_ID'),
  storageBucket: readEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'YOUR_STORAGE_BUCKET'),
  messagingSenderId: readEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'YOUR_MESSAGING_SENDER_ID'),
  appId: readEnv('NEXT_PUBLIC_FIREBASE_APP_ID', 'YOUR_APP_ID'),
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => value.trim().length > 0 && !placeholders.has(value),
);
