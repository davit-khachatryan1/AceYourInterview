import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

export const app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
