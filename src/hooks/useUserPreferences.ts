'use client';

import { useEffect, useRef } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isFirebaseConfigured } from '@/lib/firebaseConfig';
import { useUIStore } from '@/store/uiStore';
import type { Language } from '@/types/interview';

const isLanguage = (value: unknown): value is Language => value === 'en' || value === 'am';

export const useUserPreferences = ({
  uid,
  loading,
  error,
  disabled = false,
}: {
  uid: string | null;
  loading: boolean;
  error: string | null;
  disabled?: boolean;
}): { loading: boolean; error: string | null } => {
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);
  const skipNextWriteRef = useRef(false);

  useEffect(() => {
    if (disabled || !isFirebaseConfigured || !uid) {
      return;
    }

    const userRef = doc(db, 'users', uid);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const remoteLanguage = snapshot.data()?.language;
      if (isLanguage(remoteLanguage) && remoteLanguage !== language) {
        skipNextWriteRef.current = true;
        setLanguage(remoteLanguage);
      }
    });

    return () => unsubscribe();
  }, [disabled, language, setLanguage, uid]);

  useEffect(() => {
    if (disabled || !isFirebaseConfigured || !uid || loading || error) {
      return;
    }

    if (skipNextWriteRef.current) {
      skipNextWriteRef.current = false;
      return;
    }

    const userRef = doc(db, 'users', uid);
    setDoc(
      userRef,
      {
        language,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ).catch(() => {
      // Preference sync failure should not block the UI.
    });
  }, [disabled, error, language, loading, uid]);

  if (disabled || !isFirebaseConfigured) {
    return { loading: false, error: null };
  }

  return { loading, error };
};
