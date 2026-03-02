'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isFirebaseConfigured } from '@/lib/firebaseConfig';

interface UserSessionState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setupRequired: boolean;
}

export const useUserSession = (): UserSessionState => {
  const [state, setState] = useState<UserSessionState>({
    user: null,
    loading: true,
    error: null,
    setupRequired: false,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setState({
        user: null,
        loading: false,
        error: null,
        setupRequired: true,
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setState({ user: currentUser, loading: false, error: null, setupRequired: false });
        return;
      }

      try {
        await signInAnonymously(auth);
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: (error as Error).message,
          setupRequired: (error as Error).message.toLowerCase().includes('api-key-not-valid'),
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return state;
};
