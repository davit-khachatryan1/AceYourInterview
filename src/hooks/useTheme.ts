'use client';

import { useEffect, useMemo } from 'react';
import { useUIStore, type ResolvedTheme } from '@/store/uiStore';

const resolveTheme = (preference: 'system' | 'dark' | 'light'): ResolvedTheme => {
  if (preference === 'dark' || preference === 'light') {
    return preference;
  }

  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useTheme = () => {
  const theme = useUIStore((state) => state.theme);
  const resolvedTheme = useUIStore((state) => state.resolvedTheme);
  const setTheme = useUIStore((state) => state.setTheme);
  const setResolvedTheme = useUIStore((state) => state.setResolvedTheme);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      const next = resolveTheme(theme);
      setResolvedTheme(next);
      document.documentElement.setAttribute('data-theme', next);
      document.documentElement.style.colorScheme = next;
    };

    apply();

    const onChange = () => {
      if (theme === 'system') {
        apply();
      }
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [setResolvedTheme, theme]);

  return useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [resolvedTheme, setTheme, theme],
  );
};
