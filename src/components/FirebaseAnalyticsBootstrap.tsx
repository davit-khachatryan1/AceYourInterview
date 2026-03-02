'use client';

import { useEffect } from 'react';
import { app } from '@/lib/firebase';
import { firebaseConfig } from '@/lib/firebaseConfig';

const FirebaseAnalyticsBootstrap = () => {
  useEffect(() => {
    if (!firebaseConfig.measurementId || typeof window === 'undefined') {
      return;
    }

    let cancelled = false;

    const bootstrapAnalytics = async () => {
      try {
        const { getAnalytics, isSupported } = await import('firebase/analytics');
        const analyticsSupported = await isSupported();

        if (!analyticsSupported || cancelled) {
          return;
        }

        getAnalytics(app);
      } catch (error) {
        console.warn('Firebase Analytics could not be initialized.', error);
      }
    };

    void bootstrapAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
};

export default FirebaseAnalyticsBootstrap;
