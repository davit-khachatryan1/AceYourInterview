const placeholders = new Set([
  'YOUR_API_KEY',
  'YOUR_AUTH_DOMAIN',
  'YOUR_PROJECT_ID',
  'YOUR_STORAGE_BUCKET',
  'YOUR_MESSAGING_SENDER_ID',
  'YOUR_APP_ID',
]);

const requiredFirebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || 'AIzaSyCKdJWXUurX2tuTRLsBhIibXeolJBjEWI0',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || 'aceyourinterview-b01c1.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || 'aceyourinterview-b01c1',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ||
    'aceyourinterview-b01c1.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || '797177152128',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() || '1:797177152128:web:393398930d17a75ab71c65',
};

export const firebaseConfig = {
  ...requiredFirebaseConfig,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim() || 'G-VYETEKLGLT',
};

export const isFirebaseConfigured = Object.values(requiredFirebaseConfig).every(
  (value) => value.trim().length > 0 && !placeholders.has(value),
);
